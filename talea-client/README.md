# talea-client

Typed client SDK for the [talea](https://github.com/mooze-labs/talea) ledger server, plus the `talea` CLI.

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

## CLI

```
talea asset register --id BTC --class crypto --network bitcoin --precision 8 --name Bitcoin
talea account open   --book b --path cash --asset USD --kind asset --normal-side debit
talea post           --book b --idem k1 --debit cash:USD:1000 --credit deposits:USD:1000
talea post           --book b --idem k2 --draft tx.json        # or --draft - for stdin
talea balance        --book b --path cash [--as-of 2026-06-04T12:00:00Z]
talea history        --book b --path cash [--after-seq 3] [--limit 100]
talea tx             <tx_id>
talea trial-balance  --book b
talea tail           --book b [--from 1]                       # SSE as JSON lines
talea completions    zsh > ~/.zfunc/_talea                     # bash/zsh/fish/elvish/powershell
talea man            --out-dir ./man                           # talea.1 + one page per subcommand
```

`--url` / `TALEA_URL` (default `http://127.0.0.1:8080`) and `--token` / `TALEA_TOKEN` apply to every command. Posting syntax is `<account>:<asset>:<minor>`, parsed from the right, so account paths containing `:` (like `treasury:btc`) work. `--idem` is required and never auto-generated: a generated key would defeat retry safety.

## Testing

Client tests run against the real `talea-server` router on an ephemeral port backed by SQLite — not mocks. One test proves the trait symmetry: the same code passes against `LedgerService` and `TaleaClient`.

See the [workspace README](../README.md) for the full picture: quickstart, HTTP API, concepts, and design notes.
