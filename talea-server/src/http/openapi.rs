//! Compile-time OpenAPI document. Generated from the same types and
//! handlers that serve traffic, so it cannot drift from the code —
//! the drift test guards against FORGOTTEN annotations.

use utoipa::OpenApi;
use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};

use talea_core::api::*;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "talea ledger API",
        description = "Multi-currency double-entry ledger. All writes are idempotent: registry on id, transactions on the caller-supplied idempotency key.\n\nEvery error response carries the `ApiError` JSON envelope (`{\"error\": \"<tag>\", ...}`). Malformed request bodies and query strings return 400 `invalid_draft` (415 when the content-type is not application/json). Any non-streaming route may answer 408 `timeout` (processing deadline exceeded; SSE streams have no deadline), and any route 429 `overloaded` (DB pool saturation on any route, or per-book write queue full on writes), or 503 `overloaded` (admission shed; carries Retry-After) — all safe to retry with the same idempotency key."
    ),
    // a relative server keeps the document correct wherever talead is bound
    // (and satisfies generators/linters that require a servers entry)
    servers((url = "/", description = "the host serving this document")),
    paths(
        crate::http::handlers::register_asset,
        crate::http::handlers::open_account,
        crate::http::handlers::post_transaction,
        crate::http::handlers::post_batch_transactions,
        crate::http::handlers::get_transaction,
        crate::http::handlers::get_balance,
        crate::http::handlers::get_history,
        crate::http::handlers::get_trial_balance,
        crate::http::sse::events,
    ),
    components(schemas(
        WireAmount, AssetDraft, AccountDraft, PostingDraft, TransactionDraft,
        Posted, BalanceView, PostingView, TransactionView, TrialBalanceLine,
        TrialBalance, EventEnvelope, ApiError,
        talea_core::types::Direction, talea_core::types::ExternalRef,
        // BatchItem is the per-slot union type for POST /v1/transactions/batch;
        // registered so generators see the Posted | ApiError discriminant.
        crate::http::handlers::BatchItem,
        // Paged<PostingView> is NOT registered: the history path inlines it
        // (utoipa 5 removed #[aliases]); a registered copy would be dead weight
    )),
    modifiers(&BearerAuth),
)]
pub struct ApiDoc;

struct BearerAuth;

impl utoipa::Modify for BearerAuth {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.get_or_insert_with(Default::default);
        components.add_security_scheme(
            "bearer",
            SecurityScheme::Http(
                HttpBuilder::new()
                    .scheme(HttpAuthScheme::Bearer)
                    .description(Some(
                        "TALEA_API_TOKEN; omit when the server runs in open dev mode",
                    ))
                    .build(),
            ),
        );
    }
}
