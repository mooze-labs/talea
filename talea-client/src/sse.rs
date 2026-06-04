//! Auto-resuming SSE subscription.
//!
//! Semantic mapping: the trait's `from` means "first seq delivered" (store
//! semantics) while the HTTP `?from=` means "last seen" — so the first
//! connection sends `from - 1`. Reconnections send `Last-Event-ID: <last
//! seen seq>`, which the server prefers over the query param. The retry
//! budget resets after every received event: long-lived streams survive
//! unlimited transient drops; persistent failure ends the stream with a
//! final Err(Transport).

use eventsource_stream::Eventsource;
use futures::StreamExt;
use talea_core::api::{ApiError, ApiResult, EventEnvelope, EventStream};
use talea_core::types::Seq;

use crate::http::{Http, decode_error};

pub(crate) fn subscribe(http: &Http, book: &str, from: Seq) -> ApiResult<EventStream> {
    let mut url = http.url(&["books", book, "events"])?;
    url.query_pairs_mut().append_pair("from", &(from - 1).to_string());
    let client = http.client.clone();
    let token = http.token.clone();
    let retry = http.retry.clone();

    Ok(Box::pin(async_stream::stream! {
        let mut cursor: Option<Seq> = None;
        let mut failures: u32 = 0;
        'reconnect: loop {
            // no per-request timeout: SSE connections are long-lived
            let mut req = client.get(url.clone());
            if let Some(t) = &token {
                req = req.bearer_auth(t);
            }
            if let Some(last) = cursor {
                req = req.header("Last-Event-ID", last.to_string());
            }
            let resp = match req.send().await {
                Ok(r) => r,
                Err(e) => {
                    failures += 1;
                    if failures >= retry.max_attempts {
                        yield Err(ApiError::Transport {
                            message: format!("subscribe failed after {failures} attempts: {e}"),
                        });
                        return;
                    }
                    tokio::time::sleep(retry.delay_for(failures - 1, None)).await;
                    continue 'reconnect;
                }
            };

            let status = resp.status();
            if !status.is_success() {
                let body = resp.bytes().await.unwrap_or_default();
                let err = decode_error(status, &body);
                let retryable = matches!(err, ApiError::Transport { .. });
                yield Err(err);
                if !retryable {
                    return; // 401/404/...: reconnecting cannot help
                }
                failures += 1;
                if failures >= retry.max_attempts {
                    return;
                }
                tokio::time::sleep(retry.delay_for(failures - 1, None)).await;
                continue 'reconnect;
            }

            let mut events = resp.bytes_stream().eventsource();
            while let Some(frame) = events.next().await {
                match frame {
                    // the server sends `event: error` then closes; the
                    // reconnect path resumes from the cursor afterwards
                    Ok(ev) if ev.event == "error" => {
                        let err = serde_json::from_str::<ApiError>(&ev.data)
                            .unwrap_or(ApiError::Internal { message: ev.data.clone() });
                        yield Err(err);
                    }
                    Ok(ev) => match serde_json::from_str::<EventEnvelope>(&ev.data) {
                        Ok(env) => {
                            cursor = Some(env.seq);
                            failures = 0; // healthy stream: reset the budget
                            yield Ok(env);
                        }
                        Err(e) => {
                            yield Err(ApiError::Transport {
                                message: format!("undecodable event: {e}"),
                            });
                        }
                    },
                    Err(e) => {
                        // dropped mid-stream
                        failures += 1;
                        if failures >= retry.max_attempts {
                            yield Err(ApiError::Transport {
                                message: format!(
                                    "subscribe stream failed after {failures} attempts: {e}"
                                ),
                            });
                            return;
                        }
                        tokio::time::sleep(retry.delay_for(failures - 1, None)).await;
                        continue 'reconnect;
                    }
                }
            }

            // clean close: reconnect from the cursor; counts against the
            // budget so a permanently-closing endpoint cannot spin forever
            failures += 1;
            if failures >= retry.max_attempts {
                yield Err(ApiError::Transport {
                    message: format!("subscribe stream closed {failures} times"),
                });
                return;
            }
            tokio::time::sleep(retry.delay_for(failures - 1, None)).await;
        }
    }))
}
