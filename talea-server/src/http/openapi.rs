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
        description = "Multi-currency double-entry ledger. All writes are idempotent: registry on id, transactions on the caller-supplied idempotency key."
    ),
    paths(
        crate::http::handlers::register_asset,
        crate::http::handlers::open_account,
        crate::http::handlers::post_transaction,
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
