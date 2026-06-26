# Tutorial: your first ledger

You'll build a working double-entry ledger on your laptop — no Docker, no Postgres, nothing but the repo — fund it with $1,000, watch the money move live, and then try to break it with a retry and an overdraft. By the end you'll understand books, accounts, balanced postings, and why retrying a payment here can never double-charge anyone.

## What you'll need

- Rust toolchain (`rustup`, stable)
- This repository checked out; every command runs from its root
- Two terminals

## Step 1: Initialize the ledger

```bash
cargo run -p talead -- init
```

```
seed: no seed file found, skipped
wrote .env
ready. next: talead serve
```

That migrated an embedded SQLite database (`talea.db`), generated an API token, and wrote the connection settings to `.env`. One file on disk is your whole ledger.

## Step 2: Start the server

```bash
cargo run -p talead -- serve
```

```
INFO talea_server::run: talea-server listening bind=127.0.0.1:8080
```

Leave this running. Everything else happens in your second terminal. (Want proof it's alive? `curl -i http://127.0.0.1:8080/health` answers `200 ok` with an `x-talea-backend: sqlite` header.)

## Step 3: Post your first transaction

In the second terminal — export the token, create money's two sides, and move $1,000:

```bash
export TALEA_TOKEN=$(grep TALEA_API_TOKEN .env | cut -d= -f2)
alias talea="cargo run -q -p talea-cli --"

talea asset register --id USD --class fiat --precision 2 --name "US Dollar"
talea account open --book demo --path cash   --asset USD --kind asset  --normal-side debit
talea account open --book demo --path equity --asset USD --kind equity --normal-side credit

talea post --book demo --idem first-funding \
    --debit cash:USD:100000 --credit equity:USD:100000
```

```json
{
  "at": "2026-06-05T02:31:07.412906Z",
  "deduplicated": false,
  "seq": 3,
  "tx_id": "0197373f-..."
}
```

That's a committed, balanced transaction. Note `seq: 3` — the two account openings were events 1 and 2 in this book's gapless sequence and your posting is the third (the asset registration lives in the reserved `_system` book, not yours). Amounts are integer minor units: `100000` cents.

## Step 4: Read the balance

```bash
talea balance --book demo --path cash
```

```json
{
  "account": "demo:cash",
  "as_of": null,
  "asset": "USD",
  "balance": "1000.00",
  "updated_seq": 3
}
```

The integer minor units you posted render as `"1000.00"` because USD was registered with `precision 2`.

## Step 5: Retry it — on purpose

Run the **exact same** post again, same `--idem` key:

```bash
talea post --book demo --idem first-funding \
    --debit cash:USD:100000 --credit equity:USD:100000
```

```json
{
  "deduplicated": true,
  "seq": 3,
  ...
}
```

`deduplicated: true`, same `seq`, and the balance is still `1000.00`. This is the property the whole system is built around: a retry with the same idempotency key returns the original commit instead of posting twice. Network flaked? Process crashed after sending? Just send it again.

## Step 6: Try to overdraw

`cash` was opened without a floor, so give it one — open a constrained account and overdraw it:

```bash
talea account open --book demo --path fees --asset USD --kind expense --normal-side debit --min-balance 0
talea post --book demo --idem overdraw-attempt \
    --debit equity:USD:1 --credit fees:USD:1
```

```json
{"error":"constraint_violation","account":"demo:fees","min_balance":0,"would_be":-1}
```

The commit was rejected *atomically* — nothing partial was written, `seq` didn't advance. `min_balance: 0` means "never overdraw," and it works for every account kind because balances are normal-side adjusted.

## Step 7: Watch it live

Start a tail of the book's event stream:

```bash
talea tail --book demo --from 1
```

You'll first see the catch-up — every event since seq 1, including your funding transaction — then the stream goes quiet, waiting. In a third terminal (or after Ctrl-C, re-aliasing first), post something new:

```bash
talea post --book demo --idem coffee-1 --debit equity:USD:450 --credit cash:USD:450
```

The tail prints the new event the moment it commits. That stream is the same SSE endpoint your services would subscribe to, with cursor-based resume built in.

## What you built

A durable, append-only, double-entry ledger in one SQLite file with:

- a **gapless event sequence** you can audit (`talea history --book demo --path cash`),
- **idempotent commits** that make retries free,
- **commit-time constraints** that reject bad states atomically,
- a **live event stream** with resume.

The same binary, pointed at Postgres instead, is the production deployment — every concept here transfers unchanged.

Next steps:

- [How to run on Postgres](howto-run-on-postgres.md) — the production path, multi-instance included
- [How to use the Rust SDK](howto-use-the-sdk.md) — the same operations from your own services
- [HTTP API reference](reference-http-api.md) — the wire contract underneath the CLI
- [Architecture & design](explanation-architecture.md) — why it works this way
