# talea-cli

The `talea` command-line client for the [talea](https://github.com/mooze-labs/talea) ledger server — a thin shim over the [`talea-client`](../talea-client/README.md) SDK. Every command builds a `TaleaClient`, runs one operation, and prints the response as JSON, so the CLI inherits the SDK's bounded auto-retry and idempotency guarantees unchanged.

```bash
cargo run -p talea-cli -- balance --book demo --path cash
```

## Commands

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

Deeper guides: [How to use the Rust SDK](../docs/howto-use-the-sdk.md) · [Tutorial: your first ledger](../docs/tutorial-first-ledger.md).

## Testing

The CLI test drives commands in-process against the real `talea-server` router on an ephemeral port backed by SQLite — `cli::execute` returns each response as JSON, so no subprocess is spawned. See the [workspace README](../README.md) for the full picture.
