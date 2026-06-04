use std::sync::Arc;

use talea_core::store::Store;

pub struct LedgerRestApi {
    store: Arc<dyn Store>,
}

impl LedgerRestApi {
    pub fn new(store: Arc<dyn Store>) -> Self {
        Self { store }
    }
}
