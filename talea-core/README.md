# talea-core

Core contracts for the [talea](https://github.com/mooze-labs/talea) ledger — a multi-currency, double-entry ledger built for cryptocurrency operations. This crate holds everything the other crates agree on; it contains no storage, no transport, and no business policy of its own.

## What's in here

- **`types`** — the domain vocabulary: books, accounts (`book:path`, one asset each, with kind and normal side), assets (fiat or crypto, immutable decimal precision, integer minor units), transactions, postings, and sequence numbers.
- **`events`** — the ledger event types. Every write is an event in an append-only, gapless per-book log; everything else is a projection of it.
- **`store`** — the `Store` trait: the persistence contract a storage backend must fulfil. Implemented by `talea-store-postgres` and `talea-store-sqlite`, and specified in executable form by `talea-store-conformance`.
- **`api`** — the `LedgerApi` trait plus its request, response, and error types. This is the server/client contract: `LedgerService` (in `talea-server`, in-process) and `TaleaClient` (in `talea-client`, remote) both implement it, so code written against the trait runs against either.

## Where it fits

```
talea-core ── Store trait ──> talea-store-postgres / talea-store-sqlite
          └── LedgerApi trait ──> talea-server (serves it) / talea-client (calls it)
```

Depend on this crate when you want to write code that is generic over storage backends or over local-vs-remote ledger access.

See the [workspace README](../README.md) for the full picture: quickstart, HTTP API, concepts, and design notes.
