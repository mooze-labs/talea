# talea-client

Typed client SDK for the [talea](https://github.com/mooze-labs/talea) ledger server. The `talea` command-line client lives in its own [`talea-cli`](../talea-cli/README.md) crate, a thin shim over this SDK.

`TaleaClient` implements the same `LedgerApi` trait the server's in-process service does, so code written against the trait runs unchanged against either. All operations are retry-safe by construction: posts carry caller-supplied idempotency keys, registry writes are idempotent on id, reads are reads. The client retries 503/transport failures automatically within a bounded `RetryPolicy`.

## SDK

```rust
use talea_client::{TaleaClient, LedgerApi, Page};

let client = TaleaClient::builder("http://127.0.0.1:8080")
    .bearer_token("...")
    .build()?;

let posted = client.post(draft).await?;          // bounded auto-retry on 503/transport errors
let balance = client.balance("onramp", "cash", None).await?;
let mut events = client.subscribe("onramp", 1).await?;  // auto-reconnects, resumes by cursor
```

`subscribe` returns an unbroken stream of events: disconnects are retried with backoff and resumed from the last seen sequence via `Last-Event-ID`. The retry budget resets on every received event, so long-lived streams survive transient drops indefinitely while persistent failure surfaces a final error.

For the `talea` command-line client, see [`talea-cli`](../talea-cli/README.md).

Deeper guides: [How to use the Rust SDK](../docs/howto-use-the-sdk.md) · [Tutorial: your first ledger](../docs/tutorial-first-ledger.md).

## Testing

Client tests run against the real `talea-server` router on an ephemeral port backed by SQLite — not mocks. One test proves the trait symmetry: the same code passes against `LedgerService` and `TaleaClient`.

See the [workspace README](../README.md) for the full picture: quickstart, HTTP API, concepts, and design notes.
