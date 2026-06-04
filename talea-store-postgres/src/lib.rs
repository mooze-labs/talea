use std::collections::HashMap;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction as PgTx};
use uuid::Uuid;

use talea_core::{events::*, store::*, types::*};

mod helpers;

#[derive(Debug, Clone)]
pub struct PgTaleaStore {
    pool: PgPool,
}

impl PgTaleaStore {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn load_account_cfg(
        pg_tx: &mut PgTx<'_, Postgres>,
        transaction: &Transaction,
    ) -> Result<HashMap<String, AccountCfg>, StoreError> {
        todo!()
    }
}

#[async_trait]
impl Store for PgTaleaStore {
    async fn commit(&self, transaction: &Transaction) -> Result<Committed, StoreError> {
        todo!()
    }

    async fn balance(
        &self,
        account: &AccountId,
        as_of: Option<DateTime<Utc>>,
    ) -> Result<Amount, StoreError> {
        todo!()
    }

    async fn read_events(
        &self,
        book: &Book,
        from: Seq,
        limit: usize,
    ) -> Result<Vec<Sequenced<LedgerEvent>>, StoreError> {
        todo!()
    }

    fn subscribe(&self, book: &Book, from: Seq) -> EventStream {
        todo!()
    }
}

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
