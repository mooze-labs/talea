# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

talea: a multi-currency, double-entry ledger (Rust workspace). Event-sourced core, three storage backends, REST + SSE server, typed client SDK. Two binaries: `talead` (daemon: `init` + `serve`) and `talea` (client CLI, in `talea-client`).

## Commands

```bash
# The CI gate — run all three before every commit (CI runs exactly these):
cargo fmt --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace

# Single test file / single test:
cargo test -p talea-server --test http
cargo test -p talea-server --test http openapi_spec_is_complete_and_open

# Postgres conformance runs live only when a DB is reachable (otherwise skipped):
docker compose up -d
TALEA_TEST_PG_URL=postgres://talea:talea@localhost:5432/talea cargo test -p talea_store_postgres

# Run a local server (SQLite, no Docker):
cargo run -p talead -- init     # migrates sqlite://talea.db, writes .env with TALEA_API_TOKEN
cargo run -p talead -- serve    # http://127.0.0.1:8080; loads .env
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)

# Benchmarks (always --release; see talea-bench/README.md for scenario order):
cargo run --release -p talea-bench -- post-one-book
```

## Architecture

**The event log is the truth.** Every write is an event in an append-only log with a *gapless per-book sequence* (`seq`, from 1). `transactions`, `postings`, and `balances` are projections maintained in the same DB transaction as the event. Gaplessness comes from a per-book counter-row lock — that lock is also the write ceiling (one commit per commit-latency per book) and the cross-instance arbiter for horizontal scaling on Postgres.

**Two traits define every boundary** (both in `talea-core`):

- `Store` — the persistence contract. Implemented by `talea-store-postgres` (LISTEN/NOTIFY subscriptions), `talea-store-sqlite` (WAL, in-process-only subscriptions), and `talea-store-log` (embedded append-log, no external services). `talea-store-conformance` is the contract in executable form: one backend-agnostic suite all stores must pass. New store behavior goes in the conformance suite, not per-backend tests.
- `LedgerApi` — the service contract. Implemented by both `LedgerService` (in-process, `talea-server`) and `TaleaClient` (remote, `talea-client`). This symmetry is deliberate: code written against the trait runs against either, and a test proves it. Client tests run against the real router on an ephemeral port, never mocks.

**Idempotency is the system-wide invariant.** Registry writes dedupe on identity (asset `id`, account `book`+`path`); transactions dedupe on caller-supplied idempotency keys (never auto-generated — a generated key defeats retry safety). All overload responses (429 queue-full/pool-saturation, 503 admission shed, 408 timeout) assume clients retry with the same key; the SDK does this automatically. Amounts are integer minor units (`i64`) everywhere; decimals exist only in rendered output.

**HTTP layer** (`talea-server/src/http/`): axum routes under `/v1`, bearer auth (optionally book-scoped via `TALEA_TOKENS_FILE`; out-of-scope = 403, bad token = 401), admission control at the edge, per-book group-commit write queues. Every error is a tagged JSON envelope `{"error":"<tag>", ...}`. The OpenAPI document is generated at compile time by utoipa (`src/http/openapi.rs`) — new handlers must be registered there.

**Documentation is drift-tested.** `talea-server/tests/http.rs` pins router ⇄ OpenAPI; `talea-server/tests/agent_docs_drift.rs` pins the endpoint table in `docs/AGENTS-INTEGRATION.md` ⇄ OpenAPI and checks links in it and `docs/llms.txt`. Adding or changing a route fails `cargo test` until both the openapi registration and the agent doc's table are updated.

## Conventions

- **Panic-free production code**: `unwrap_used`/`expect_used` are denied workspace-wide and `unsafe_code` is forbidden (workspace `Cargo.toml`). Tests are exempt (`clippy.toml`) but integration-test files need `#![allow(clippy::expect_used)]` / `unwrap_used` at the top since `--all-targets` lints them.
- **Worktrees**: multiple agents share this repo. Always work in a dedicated worktree, never the main checkout.
- **Staging**: never `git add -A`; stage named files only. `docs/superpowers/` holds untracked working documents (specs/plans) — never commit anything under it. The rest of `docs/` is normal committable documentation.
- **Docs are published**: `docs-pages.yml` rsyncs `docs/` to the GitHub Pages site root (https://mooze-labs.github.io/talea/) on every push to `main` that touches `docs/**`. The docs follow Diataxis (`docs/README.md` is the index); `docs/llms.txt` and `docs/AGENTS-INTEGRATION.md` are the LLM-facing entry points.
- **Performance decisions gate on CI, not local runs**: macOS dev-rig bench numbers are distorted (Docker VM fsync, proxy gaps). `bench.yml` runs a trimmed profile per push to `main` and a full sweep nightly, charting trends at https://mooze-labs.github.io/talea/dev/bench/. Never compare absolute bench numbers across backends — compare each backend against its own baseline. Perf tweaks that only help dev rigs become documented env knobs, never changed production defaults.
- **Local test flakes**: `as_of` conformance tests can flake locally from VM clock skew (margins are ~20ms) — re-run single-threaded before suspecting code; CI is authoritative. A leftover `talead` on port 8080 makes bench/integration runs fail `Unauthorized` after a false-positive health check — check `lsof -i :8080` first.
