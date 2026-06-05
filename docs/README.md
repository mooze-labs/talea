# talea documentation

Organized by what you're trying to do ([Diataxis](https://diataxis.fr/)):

| | Read this | When |
|---|---|---|
| **Tutorial** | [Your first ledger](tutorial-first-ledger.md) | You're new — zero to a funded, streaming ledger in seven steps |
| **How-to** | [Run on Postgres](howto-run-on-postgres.md) | You're deploying — compose, auth, LB readiness, multi-instance, metrics |
| **How-to** | [Use the Rust SDK](howto-use-the-sdk.md) | You're integrating from a service — retries, idempotency, streaming |
| **Reference** | [HTTP API](reference-http-api.md) | You need the exact wire contract — routes, shapes, errors, config |
| **Explanation** | [Architecture & design](explanation-architecture.md) | You want to know *why* — gapless sequences, group commit, the failure story |

Shorter summaries live in the [project README](../README.md); per-crate READMEs cover each crate's surface. The interactive API reference is served by any running instance at `/docs`.

> Workflow note: `docs/superpowers/` holds untracked working documents (specs/plans) — not part of this documentation set.
