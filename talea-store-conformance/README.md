# talea-store-conformance

Backend-agnostic conformance suite for the `Store` trait from `talea-core` — the persistence contract of the [talea](https://github.com/mooze-labs/talea) ledger, in executable form. Not published; consumed as a dev-dependency by the store crates.

Both `talea-store-postgres` and `talea-store-sqlite` run this identical suite. If you write a new backend, passing this suite is the definition of done.

## What it checks

- **Idempotency**: replaying a commit with the same idempotency key returns the original result, never double-posts.
- **Gapless per-book sequences**: events are `1..N` per book with no holes, under concurrent writers.
- **Balance enforcement**: normal-side-adjusted balances and `min_balance` checks at commit time.
- **Pagination**: history pages never split one transaction's postings across pages.
- **Subscriptions**: catch-up from a cursor plus live delivery, in order.

## Usage

Add as a dev-dependency and call the suite functions from your backend's tests, handing each one a fresh `Store`. Every fixture generates unique ids, so the suite can run repeatedly against a shared database (e.g. a developer's Postgres):

```bash
cargo test -p talea-store-sqlite        # no setup
TALEA_TEST_PG_URL=postgres://postgres:dev@localhost:5432 \
    cargo test -p talea-store-postgres  # against live Postgres
```

See the [workspace README](../README.md) for the full picture.
