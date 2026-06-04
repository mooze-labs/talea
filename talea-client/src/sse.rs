//! Auto-resuming SSE subscription. Implemented in a later task.

use talea_core::api::{ApiResult, EventStream};
use talea_core::types::Seq;

use crate::http::Http;

pub(crate) fn subscribe(_http: &Http, _book: &str, _from: Seq) -> ApiResult<EventStream> {
    todo!()
}
