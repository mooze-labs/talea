# talead

The [talea](https://github.com/mooze-labs/talea) ledger daemon. Two subcommands; zero-to-serving in two of them.

```bash
cargo run -p talead -- init        # migrate, generate an API token, apply seed, write .env
cargo run -p talead -- serve       # serve http://127.0.0.1:8080 using .env
```

## `talead init`

Idempotent setup, safe to re-run:

- Connects to `--db-url` (default `sqlite://talea.db`; also takes `postgres://...`) and runs migrations.
- Generates a random API token and writes `.env` (`TALEA_DB_URL`, `TALEA_API_TOKEN`). An existing `.env` is left untouched unless `--force`.
- Applies a declarative seed when `talea.seed.toml` exists (see `talea.seed.example.toml` at the workspace root): assets and accounts in TOML, applied idempotently on every run — already-present entries are counted, not errored.

```
talead init [--db-url <url>] [--seed <path>] [--env-out <path>] [--force]
```

## `talead serve`

Loads `.env` if present (real environment variables win), then runs the server from [`talea-server`](../talea-server/README.md): axum REST + SSE, bearer auth, admission control. Configuration:

| Variable | Default | Meaning |
|---|---|---|
| `TALEA_DB_URL` | required | `postgres://...` or `sqlite://path.db` (`:memory:` is rejected) |
| `TALEA_BIND` | `127.0.0.1:8080` | Listen address |
| `TALEA_API_TOKEN` | unset | Bearer token; unset means OPEN dev mode (logged loudly) |
| `TALEA_DB_POOL` | `10` | Connection pool size |
| `TALEA_MAX_INFLIGHT` | `256` | In-flight request cap; excess sheds as 503 |

Talk to it with the `talea` CLI or SDK from [`talea-client`](../talea-client/README.md). See the [workspace README](../README.md) for a full quickstart.
