window.BENCHMARK_DATA = {
  "lastUpdate": 1788685375661,
  "repoUrl": "https://github.com/mooze-labs/talea",
  "entries": {
    "bench-push-bigger": [
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "13b084824edb8caeb0279df029bac988f359da9a",
          "message": "docs: document CI bench trend tracking and the summarize subcommand\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T00:35:03-03:00",
          "tree_id": "f3c11f0b5272be60d1f04f6fc8ff539499b21495",
          "url": "https://github.com/mooze-labs/talea/commit/13b084824edb8caeb0279df029bac988f359da9a"
        },
        "date": 1780632120509,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1570.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 9883.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 482.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2776.1,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "9bd29b1b50c9b6eb286c44dac809c36931aa21cc",
          "message": "feat(ci): sync docs/ to gh-pages so Pages serves docs and bench charts together",
          "timestamp": "2026-06-05T01:07:28-03:00",
          "tree_id": "3122b81a16416d0e2d7a23107841dafaa86d57db",
          "url": "https://github.com/mooze-labs/talea/commit/9bd29b1b50c9b6eb286c44dac809c36931aa21cc"
        },
        "date": 1780632830923,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2071.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 14940.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 700.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4266.6,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "5c15e76f24516e1331cdd13d00665abd019a943c",
          "message": "fix(server): out-of-scope tx-by-id answers 404, closing the existence oracle\n\nGET /v1/transactions/{tx_id} loaded the transaction and then answered\n403 Forbidden{book} when the token's scope didn't cover its book. Since\ntx ids are global (unlike the book-prefixed routes, whose 403s only\necho a caller-supplied name), that 403 confirmed the id exists and\nleaked the owning book's name to a token with no rights to it.\n\nOut-of-scope reads now answer 404 with a body byte-identical to a true\nmiss. The book-prefixed routes keep their pre-lookup 403: it reveals\nnothing and tells clients their token is misconfigured.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T02:04:16-03:00",
          "tree_id": "945cdc107999a1295a285e9c87f451a4bf9cd832",
          "url": "https://github.com/mooze-labs/talea/commit/5c15e76f24516e1331cdd13d00665abd019a943c"
        },
        "date": 1780636762432,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2001.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 14690.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 677.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4178.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "18790a97415a6f30369702b8782376e3785f1304",
          "message": "docs: note the tx-by-id 404-on-out-of-scope behavior in howtos\n\nThe Postgres hardening howto and the SDK troubleshooting section still\ndescribed the blanket 403; reference-http-api.md was already updated\nwith the fix itself.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T02:15:10-03:00",
          "tree_id": "c9a0f10de3852d327ac2c833f17c85472d874b58",
          "url": "https://github.com/mooze-labs/talea/commit/18790a97415a6f30369702b8782376e3785f1304"
        },
        "date": 1780637149265,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1557.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10031.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 478.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2758.2,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "bb79655d9fa95c542d3ad034c6c2f8bf43bdc74e",
          "message": "Merge worktree-bench-log-leg: CI bench leg + caveats for the log backend\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T10:54:47-03:00",
          "tree_id": "189d5e66ec00b6d36e3fff5375de5e740334e66d",
          "url": "https://github.com/mooze-labs/talea/commit/bb79655d9fa95c542d3ad034c6c2f8bf43bdc74e"
        },
        "date": 1780668370264,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1601.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10106.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 488.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2776.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 4817.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26903.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "c15dd14d74a358e464f9b835acde34f995fb7c2e",
          "message": "style: cargo fmt over the log-store feature\n\nCI's Format gate caught what the local loops never ran — tests and\nclippy gated every task, fmt gated none of them.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T11:10:10-03:00",
          "tree_id": "d0e4238ca951c85670e3fd906ba225ad0233ca51",
          "url": "https://github.com/mooze-labs/talea/commit/c15dd14d74a358e464f9b835acde34f995fb7c2e"
        },
        "date": 1780672859711,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1608.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10153.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 488,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2767.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5277,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26959.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "c7769821d2631a2ec1416049a1d4a98a8406f226",
          "message": "Merge remote-tracking branch 'origin/main' into feature/setbased-batch-commit",
          "timestamp": "2026-06-06T01:02:51-03:00",
          "tree_id": "4727ee51c11f19457be651ac428327f9355b671d",
          "url": "https://github.com/mooze-labs/talea/commit/c7769821d2631a2ec1416049a1d4a98a8406f226"
        },
        "date": 1780719430421,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1583.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 9904.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1426.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2704.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5209.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26953.6,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "24c3eac15a0c284730e3df953c05f45833b3fcc6",
          "message": "Merge remote-tracking branch 'origin/main'",
          "timestamp": "2026-06-06T01:19:00-03:00",
          "tree_id": "dccf68ef8a649bdb010b5460bd6b28f70c8a35d6",
          "url": "https://github.com/mooze-labs/talea/commit/24c3eac15a0c284730e3df953c05f45833b3fcc6"
        },
        "date": 1780720201262,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1628.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10175.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1517.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2770.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5588.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26492.2,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "4de5f153ebde4592eca225c65d6a1a636c36586e",
          "message": "docs: batch-endpoint throughput in the log-store performance notes; link live CI charts\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T11:43:05-03:00",
          "tree_id": "02a7ec9caab2f693238de23cc9445c9d9cef4528",
          "url": "https://github.com/mooze-labs/talea/commit/4de5f153ebde4592eca225c65d6a1a636c36586e"
        },
        "date": 1780757524917,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1615.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10011,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1499.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2776,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5436.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26403.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "b839c9bf60de278667f0e631dd6ee0465eb7fa82",
          "message": "Merge worktree-bench-batch-ci: batch-mode step in the CI bench\n\nsummarize mints {scenario}/{backend}/batch-{N}/... names for batch runs\n(batch_size 1 keeps legacy names; mixed sizes within a run error loudly),\nand both bench profiles run post-one-book --concurrency 8 --batch-size 25\n(200 in-flight drafts, fits default queue depth — no server env changes).\nLocal trimmed log leg verified: batch series minted alongside untouched\nlegacy names, zero shedding, 10.3k drafts/s vs 1.2k singles.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T11:54:09-03:00",
          "tree_id": "3608cf19cf0dfadce2429fc9e00e33eab6036161",
          "url": "https://github.com/mooze-labs/talea/commit/b839c9bf60de278667f0e631dd6ee0465eb7fa82"
        },
        "date": 1780758258076,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1604,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1882.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 9809.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1463.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7487.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2724.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 4825.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 14682.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26111.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "4ae8481b20329280597a5a02a7a9486138ec098c",
          "message": "Merge branch 'worktree-deny-unwrap-expect-unsafe'",
          "timestamp": "2026-06-06T12:12:27-03:00",
          "tree_id": "578940ec036ef365bb5838bf1187ac6462cf615e",
          "url": "https://github.com/mooze-labs/talea/commit/4ae8481b20329280597a5a02a7a9486138ec098c"
        },
        "date": 1780759600344,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1737.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2112.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10375.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1600.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7770,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2860.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5687.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 17095,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 27147.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "fd52c603afb1a2dcaa37dfb8f6201a3ac08ffd33",
          "message": "Merge worktree-agent-integration-docs: agent-oriented integration docs with drift tests",
          "timestamp": "2026-06-06T14:41:27-03:00",
          "tree_id": "7c01e90a4ffc34d49e44b4005d7063bfe5f04562",
          "url": "https://github.com/mooze-labs/talea/commit/fd52c603afb1a2dcaa37dfb8f6201a3ac08ffd33"
        },
        "date": 1780771877622,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1755.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2112.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10328.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1549.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7802.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2851.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5363.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 16357.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 27909.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "52df38742202942c7a1af5952fd09bb04d982b72",
          "message": "docs: CLAUDE.md — commands, architecture, and conventions for AI assistants\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T15:54:54-03:00",
          "tree_id": "e02cf63e7c2beba7a78968eb643d9765243ff685",
          "url": "https://github.com/mooze-labs/talea/commit/52df38742202942c7a1af5952fd09bb04d982b72"
        },
        "date": 1780772665105,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1828.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2375,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11588.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1725.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 8000,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3148.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 6221.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 17942.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 34369.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "8bf6d1953f82658e7ed8374cd0c1e78dc50f369b",
          "message": "test: protection probe (must be rejected by GitHub)",
          "timestamp": "2026-06-06T16:17:34-03:00",
          "tree_id": "e02cf63e7c2beba7a78968eb643d9765243ff685",
          "url": "https://github.com/mooze-labs/talea/commit/8bf6d1953f82658e7ed8374cd0c1e78dc50f369b"
        },
        "date": 1780774024018,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1625.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1915,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10025.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1510.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7580,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2762.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5348.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 16180,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26626.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f80270387db97ba7b9e8240003fc7f30f547a0e7",
          "message": "Merge worktree-pr-shipping-convention: PR-based shipping convention in CLAUDE.md\n\nPR-based shipping convention",
          "timestamp": "2026-06-06T16:27:35-03:00",
          "tree_id": "0538e334ed395b37c7620582a9e8b58736771380",
          "url": "https://github.com/mooze-labs/talea/commit/f80270387db97ba7b9e8240003fc7f30f547a0e7"
        },
        "date": 1780774635015,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1762.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2290,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11415.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1609.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7110,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3088.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5997.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 16365,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 33578.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-06T21:15:20-03:00",
          "tree_id": "6fbb496e0cc0a4c1636904e6307cfe57e50ce000",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780791890477,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1594.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1850,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 9891.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1455.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7437.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2738.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5161.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 15447.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26305.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3716a8f52887af8d68761991341140b3cc8b8fa5",
          "message": "Merge worktree-client-cli-feature-gate: feature-gate talea CLI so SDK drops clap\n\nbuild: feature-gate the talea CLI so the SDK drops clap",
          "timestamp": "2026-06-09T07:56:59-03:00",
          "tree_id": "f2bf75dd8ed62640c5bb00cb292a8feb779817fb",
          "url": "https://github.com/mooze-labs/talea/commit/3716a8f52887af8d68761991341140b3cc8b8fa5"
        },
        "date": 1781003193648,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1600,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1870,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10057.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1466.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7070,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2770.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5239.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 15307.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26978.5,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4f36294f571686ffd21a2bfecb9095fe1e85392b",
          "message": "Merge worktree-client-cli-test-guard: gate cli integration test behind cli feature\n\ntest: gate cli integration test behind the cli feature",
          "timestamp": "2026-06-09T08:06:44-03:00",
          "tree_id": "06cfc1eb2103f379725e83b602b6b860042c7939",
          "url": "https://github.com/mooze-labs/talea/commit/4f36294f571686ffd21a2bfecb9095fe1e85392b"
        },
        "date": 1781003779402,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1837.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2335,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11475.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1712.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7917.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3063.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 6184.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 17630,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 33874.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T08:18:14-03:00",
          "tree_id": "e9f1cf231fc3a4cc44715d6a448c1a138540fdf4",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781004465206,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1587.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1870,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10138.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1507.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7490,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2789.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 4924.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 14987.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26979.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T04:43:50-03:00",
          "tree_id": "9cac686ef77425dd2bf043debfdf283990ff1fa3",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781682845945,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1709.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2035,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10191.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1487.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7395,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2782.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 4572.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 15217.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 26626.8,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "796b8e862984ebfcf5a24cb4c692a0bdac9a5e9c",
          "message": "Merge worktree-talea-publish-prep: bump talea-client to 0.1.2 and pin in talea-cli\n\nrelease: bump talea-client to 0.1.2 (lib-only), pin it in talea-cli",
          "timestamp": "2026-06-27T00:54:58-03:00",
          "tree_id": "7a0eff90f8ef86043eb7c1a1aee0ea11548905ec",
          "url": "https://github.com/mooze-labs/talea/commit/796b8e862984ebfcf5a24cb4c692a0bdac9a5e9c"
        },
        "date": 1782533102783,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1973.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2570,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 14367.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1871.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 8045,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4082.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 6852.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 18895,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37915.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T01:19:43-03:00",
          "tree_id": "cd29bd23b907fbc42fbb9139dc92b25e5964bb36",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782534555439,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1616.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1900,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 10111.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 1494.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7585,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2765,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5370.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 15947.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 27179.2,
            "unit": "ops/s"
          }
        ]
      }
    ],
    "bench-push-smaller": [
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "13b084824edb8caeb0279df029bac988f359da9a",
          "message": "docs: document CI bench trend tracking and the summarize subcommand\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T00:35:03-03:00",
          "tree_id": "f3c11f0b5272be60d1f04f6fc8ff539499b21495",
          "url": "https://github.com/mooze-labs/talea/commit/13b084824edb8caeb0279df029bac988f359da9a"
        },
        "date": 1780632121889,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9703,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1561,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7423,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11487,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 21119,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4155,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6863,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11583,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "9bd29b1b50c9b6eb286c44dac809c36931aa21cc",
          "message": "feat(ci): sync docs/ to gh-pages so Pages serves docs and bench charts together",
          "timestamp": "2026-06-05T01:07:28-03:00",
          "tree_id": "3122b81a16416d0e2d7a23107841dafaa86d57db",
          "url": "https://github.com/mooze-labs/talea/commit/9bd29b1b50c9b6eb286c44dac809c36931aa21cc"
        },
        "date": 1780632832877,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 7347,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1058,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7263,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11239,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 13375,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2711,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5607,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 12015,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "5c15e76f24516e1331cdd13d00665abd019a943c",
          "message": "fix(server): out-of-scope tx-by-id answers 404, closing the existence oracle\n\nGET /v1/transactions/{tx_id} loaded the transaction and then answered\n403 Forbidden{book} when the token's scope didn't cover its book. Since\ntx ids are global (unlike the book-prefixed routes, whose 403s only\necho a caller-supplied name), that 403 confirmed the id exists and\nleaked the owning book's name to a token with no rights to it.\n\nOut-of-scope reads now answer 404 with a body byte-identical to a true\nmiss. The book-prefixed routes keep their pre-lookup 403: it reveals\nnothing and tells clients their token is misconfigured.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T02:04:16-03:00",
          "tree_id": "945cdc107999a1295a285e9c87f451a4bf9cd832",
          "url": "https://github.com/mooze-labs/talea/commit/5c15e76f24516e1331cdd13d00665abd019a943c"
        },
        "date": 1780636764469,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 7415,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1070,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7903,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11135,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 13559,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2787,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5851,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11967,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "18790a97415a6f30369702b8782376e3785f1304",
          "message": "docs: note the tx-by-id 404-on-out-of-scope behavior in howtos\n\nThe Postgres hardening howto and the SDK troubleshooting section still\ndescribed the blanket 403; reference-http-api.md was already updated\nwith the fix itself.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T02:15:10-03:00",
          "tree_id": "c9a0f10de3852d327ac2c833f17c85472d874b58",
          "url": "https://github.com/mooze-labs/talea/commit/18790a97415a6f30369702b8782376e3785f1304"
        },
        "date": 1780637151408,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9671,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1520,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7407,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11983,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 20671,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4155,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6975,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11719,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "bb79655d9fa95c542d3ad034c6c2f8bf43bdc74e",
          "message": "Merge worktree-bench-log-leg: CI bench leg + caveats for the log backend\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T10:54:47-03:00",
          "tree_id": "189d5e66ec00b6d36e3fff5375de5e740334e66d",
          "url": "https://github.com/mooze-labs/talea/commit/bb79655d9fa95c542d3ad034c6c2f8bf43bdc74e"
        },
        "date": 1780668372674,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9375,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1514,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7167,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11431,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 20399,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4183,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6927,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11895,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4351,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 738,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2611,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 716,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "c15dd14d74a358e464f9b835acde34f995fb7c2e",
          "message": "style: cargo fmt over the log-store feature\n\nCI's Format gate caught what the local loops never ran — tests and\nclippy gated every task, fmt gated none of them.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-05T11:10:10-03:00",
          "tree_id": "d0e4238ca951c85670e3fd906ba225ad0233ca51",
          "url": "https://github.com/mooze-labs/talea/commit/c15dd14d74a358e464f9b835acde34f995fb7c2e"
        },
        "date": 1780672861426,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9647,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1505,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7235,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11503,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 20207,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4267,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6983,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11599,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4443,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 720,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2545,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 692,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "c7769821d2631a2ec1416049a1d4a98a8406f226",
          "message": "Merge remote-tracking branch 'origin/main' into feature/setbased-batch-commit",
          "timestamp": "2026-06-06T01:02:51-03:00",
          "tree_id": "4727ee51c11f19457be651ac428327f9355b671d",
          "url": "https://github.com/mooze-labs/talea/commit/c7769821d2631a2ec1416049a1d4a98a8406f226"
        },
        "date": 1780719432438,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9791,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1553,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7443,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11631,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8583,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4347,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6983,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11239,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3927,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 711,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2597,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 684,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "24c3eac15a0c284730e3df953c05f45833b3fcc6",
          "message": "Merge remote-tracking branch 'origin/main'",
          "timestamp": "2026-06-06T01:19:00-03:00",
          "tree_id": "dccf68ef8a649bdb010b5460bd6b28f70c8a35d6",
          "url": "https://github.com/mooze-labs/talea/commit/24c3eac15a0c284730e3df953c05f45833b3fcc6"
        },
        "date": 1780720202559,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9095,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1497,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7139,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11695,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6103,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4179,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6907,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11367,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1842,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 712,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2541,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 694,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "4de5f153ebde4592eca225c65d6a1a636c36586e",
          "message": "docs: batch-endpoint throughput in the log-store performance notes; link live CI charts\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T11:43:05-03:00",
          "tree_id": "02a7ec9caab2f693238de23cc9445c9d9cef4528",
          "url": "https://github.com/mooze-labs/talea/commit/4de5f153ebde4592eca225c65d6a1a636c36586e"
        },
        "date": 1780757526547,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9207,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1529,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7495,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11639,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6647,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4211,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6903,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11223,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2131,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 714,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2573,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 696,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "b839c9bf60de278667f0e631dd6ee0465eb7fa82",
          "message": "Merge worktree-bench-batch-ci: batch-mode step in the CI bench\n\nsummarize mints {scenario}/{backend}/batch-{N}/... names for batch runs\n(batch_size 1 keeps legacy names; mixed sizes within a run error loudly),\nand both bench profiles run post-one-book --concurrency 8 --batch-size 25\n(200 in-flight drafts, fits default queue depth — no server env changes).\nLocal trimmed log leg verified: batch series minted alongside untouched\nlegacy names, zero shedding, 10.3k drafts/s vs 1.2k singles.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T11:54:09-03:00",
          "tree_id": "3608cf19cf0dfadce2429fc9e00e33eab6036161",
          "url": "https://github.com/mooze-labs/talea/commit/b839c9bf60de278667f0e631dd6ee0465eb7fa82"
        },
        "date": 1780758259661,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9279,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145023,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1557,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7523,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11463,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7147,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36991,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4271,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6995,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11687,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3393,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23295,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 752,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2741,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 724,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "4ae8481b20329280597a5a02a7a9486138ec098c",
          "message": "Merge branch 'worktree-deny-unwrap-expect-unsafe'",
          "timestamp": "2026-06-06T12:12:27-03:00",
          "tree_id": "578940ec036ef365bb5838bf1187ac6462cf615e",
          "url": "https://github.com/mooze-labs/talea/commit/4ae8481b20329280597a5a02a7a9486138ec098c"
        },
        "date": 1780759601772,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9279,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 129215,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1476,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7055,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11239,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6311,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35295,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4035,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6687,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11319,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1908,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 16959,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 700,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2595,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 675,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "fd52c603afb1a2dcaa37dfb8f6201a3ac08ffd33",
          "message": "Merge worktree-agent-integration-docs: agent-oriented integration docs with drift tests",
          "timestamp": "2026-06-06T14:41:27-03:00",
          "tree_id": "7c01e90a4ffc34d49e44b4005d7063bfe5f04562",
          "url": "https://github.com/mooze-labs/talea/commit/fd52c603afb1a2dcaa37dfb8f6201a3ac08ffd33"
        },
        "date": 1780771879756,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9183,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 128575,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1499,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7087,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11031,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7971,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34943,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4085,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6767,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11279,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2763,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22559,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 684,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2629,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 668,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "52df38742202942c7a1af5952fd09bb04d982b72",
          "message": "docs: CLAUDE.md — commands, architecture, and conventions for AI assistants\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T15:54:54-03:00",
          "tree_id": "e02cf63e7c2beba7a78968eb643d9765243ff685",
          "url": "https://github.com/mooze-labs/talea/commit/52df38742202942c7a1af5952fd09bb04d982b72"
        },
        "date": 1780772666427,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8147,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 112319,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1320,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7167,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 10495,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5627,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33887,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3693,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6387,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 10431,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2019,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 16015,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 552,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2339,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 536,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "committer": {
            "email": "h4vismat@mooze.app",
            "name": "havis",
            "username": "h4vismat"
          },
          "distinct": true,
          "id": "8bf6d1953f82658e7ed8374cd0c1e78dc50f369b",
          "message": "test: protection probe (must be rejected by GitHub)",
          "timestamp": "2026-06-06T16:17:34-03:00",
          "tree_id": "e02cf63e7c2beba7a78968eb643d9765243ff685",
          "url": "https://github.com/mooze-labs/talea/commit/8bf6d1953f82658e7ed8374cd0c1e78dc50f369b"
        },
        "date": 1780774025360,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8975,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142079,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1522,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7163,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11023,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6575,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36863,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4207,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6851,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11335,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2549,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 17071,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 708,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2633,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 691,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f80270387db97ba7b9e8240003fc7f30f547a0e7",
          "message": "Merge worktree-pr-shipping-convention: PR-based shipping convention in CLAUDE.md\n\nPR-based shipping convention",
          "timestamp": "2026-06-06T16:27:35-03:00",
          "tree_id": "0538e334ed395b37c7620582a9e8b58736771380",
          "url": "https://github.com/mooze-labs/talea/commit/f80270387db97ba7b9e8240003fc7f30f547a0e7"
        },
        "date": 1780774637105,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8599,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116479,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1408,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7615,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11279,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6591,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39391,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4279,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6859,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11223,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1978,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24655,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 575,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2711,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 618,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-06T21:15:20-03:00",
          "tree_id": "6fbb496e0cc0a4c1636904e6307cfe57e50ce000",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780791892039,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9583,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145535,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1559,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7307,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11415,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7803,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36671,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4243,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6987,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11319,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3641,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 18879,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 739,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2661,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 719,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3716a8f52887af8d68761991341140b3cc8b8fa5",
          "message": "Merge worktree-client-cli-feature-gate: feature-gate talea CLI so SDK drops clap\n\nbuild: feature-gate the talea CLI so the SDK drops clap",
          "timestamp": "2026-06-09T07:56:59-03:00",
          "tree_id": "f2bf75dd8ed62640c5bb00cb292a8feb779817fb",
          "url": "https://github.com/mooze-labs/talea/commit/3716a8f52887af8d68761991341140b3cc8b8fa5"
        },
        "date": 1781003195111,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9551,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145663,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1524,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7339,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11527,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7743,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39007,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4179,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7123,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11423,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3467,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 18863,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 735,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2621,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 709,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4f36294f571686ffd21a2bfecb9095fe1e85392b",
          "message": "Merge worktree-client-cli-test-guard: gate cli integration test behind cli feature\n\ntest: gate cli integration test behind the cli feature",
          "timestamp": "2026-06-09T08:06:44-03:00",
          "tree_id": "06cfc1eb2103f379725e83b602b6b860042c7939",
          "url": "https://github.com/mooze-labs/talea/commit/4f36294f571686ffd21a2bfecb9095fe1e85392b"
        },
        "date": 1781003781680,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8123,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 119359,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1426,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7211,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11031,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6207,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 32991,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4947,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7031,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11279,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2053,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 20815,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 555,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2523,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 542,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T08:18:14-03:00",
          "tree_id": "e9f1cf231fc3a4cc44715d6a448c1a138540fdf4",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781004466838,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9655,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142079,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1496,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7467,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11807,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6539,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37951,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4139,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6867,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11271,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4439,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 18495,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 756,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2695,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 713,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T04:43:50-03:00",
          "tree_id": "9cac686ef77425dd2bf043debfdf283990ff1fa3",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781682848202,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9455,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 134015,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1512,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7027,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11631,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 10079,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 41279,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4107,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6927,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11383,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 5371,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 25231,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 727,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2669,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 688,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "796b8e862984ebfcf5a24cb4c692a0bdac9a5e9c",
          "message": "Merge worktree-talea-publish-prep: bump talea-client to 0.1.2 and pin in talea-cli\n\nrelease: bump talea-client to 0.1.2 (lib-only), pin it in talea-cli",
          "timestamp": "2026-06-27T00:54:58-03:00",
          "tree_id": "7a0eff90f8ef86043eb7c1a1aee0ea11548905ec",
          "url": "https://github.com/mooze-labs/talea/commit/796b8e862984ebfcf5a24cb4c692a0bdac9a5e9c"
        },
        "date": 1782533105046,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 7667,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 104383,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1092,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7859,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11055,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5299,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33631,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2811,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5887,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11871,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1593,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 15223,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 527,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2515,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 507,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "h4vismat@pm.me",
            "name": "h4vismat",
            "username": "h4vismat"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T01:19:43-03:00",
          "tree_id": "cd29bd23b907fbc42fbb9139dc92b25e5964bb36",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782534557711,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9471,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142335,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1505,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7239,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 11479,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6911,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36095,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4139,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6867,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 11343,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2691,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22847,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 727,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2667,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 692,
            "unit": "us"
          }
        ]
      }
    ],
    "bench-nightly-bigger": [
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "70494f577e6e3ccafdb36b2d78b34011690d88f4",
          "message": "Merge branch 'fix/sqlite-begin-immediate'",
          "timestamp": "2026-06-05T05:20:15Z",
          "url": "https://github.com/mooze-labs/talea/commit/70494f577e6e3ccafdb36b2d78b34011690d88f4"
        },
        "date": 1780639744682,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2185.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1517.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13876.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2120.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 851.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 639.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 1641.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3077.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 518.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 782.0333333333333,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "3f0da95680e6a65910d3fed3b90e284f4e09dbdf",
          "message": "style: cargo fmt over the store-log merge (mainline Format gate is red)",
          "timestamp": "2026-06-05T14:07:33Z",
          "url": "https://github.com/mooze-labs/talea/commit/3f0da95680e6a65910d3fed3b90e284f4e09dbdf"
        },
        "date": 1780672308713,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1741.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1347.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12045.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1705.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 888.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4921.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2323.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2769.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5242.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 532.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7834.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12571.033333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37684.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8245.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13722.066666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "5ab65e8e312cc4004481f0cd28729bd28c717d7c",
          "message": "fix(server): pool-acquire timeout answers backpressure (429), not 500",
          "timestamp": "2026-06-05T16:03:13Z",
          "url": "https://github.com/mooze-labs/talea/commit/5ab65e8e312cc4004481f0cd28729bd28c717d7c"
        },
        "date": 1780679442350,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1936.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1469.8666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12274.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1866.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 874.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5045.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2364.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2818,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5419.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 531.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8180.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12861.433333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36967.933333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8852.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14226.8,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "24c3eac15a0c284730e3df953c05f45833b3fcc6",
          "message": "Merge remote-tracking branch 'origin/main'",
          "timestamp": "2026-06-06T04:19:00Z",
          "url": "https://github.com/mooze-labs/talea/commit/24c3eac15a0c284730e3df953c05f45833b3fcc6"
        },
        "date": 1780731864492,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1782.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1382.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11918.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1689.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 850.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4870.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2299.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2745.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5289.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 527.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8204.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12284.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36335.13333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8866.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12189.933333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-07T00:15:20Z",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780820426284,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2144.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2338.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1511.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13658.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2094.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 840.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5268.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7865.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2525.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3090.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5694.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 534.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7880.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13896.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13168.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46633.3,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8556.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13707.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-07T00:15:20Z",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780910965842,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1761.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1892.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1358.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11852.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1693.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 871.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4874.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7641.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2327.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2746.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5178.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 512.1666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8171.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12645.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12246.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37070.63333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8566.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13491.1,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-07T00:15:20Z",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780992281487,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1826.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1958.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1453.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12277.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1764.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 849.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5020.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7675.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2386,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2804.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5328.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 517.3333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7965.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13120,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12165.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37053.86666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8047.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13166.733333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781079849095,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1740.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1850,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1366.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11808.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1685.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 880.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4756.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7300,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2263.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2714.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5243.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 485.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7790.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12390.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12369.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35465.73333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7538.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12488.166666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781169762233,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1769.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1887.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1367.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11706.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1658.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 860.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4770.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7330.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2300.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2731.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5210.7,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 526.5666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8082.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12306.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12219.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37205.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7755.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13208.1,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781255331506,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1709.8666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1836.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1331.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11734.133333333331,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1658.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 855.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4696.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7187.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2304.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2707.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5229.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 503.1333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8071.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12545.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12278.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36432.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8618.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12307.833333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781338400672,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1790.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1925.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1377.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11891.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1715.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 824.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4770.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7340.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2288.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2696.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5228.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 513.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8123.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12716.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12080.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36807.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8389.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12314.533333333333,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781427818649,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2120.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2331.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1467.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13363.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2046.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 838.2333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4923.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7265.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2418.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3018.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5302.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 514.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7604.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12943.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13269.633333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46574.13333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8837.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12881.733333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781520245134,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1775.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1917.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1346.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12072.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1697.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 884.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4913.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7475.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2344.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2797.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5191.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 518.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8367.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13000,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12387.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36938,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8704.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12565.133333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781604676669,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1786.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1909.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1369.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12102.3,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1717,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 869,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4906.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7515.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2376.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2695.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5273.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 507.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8368.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12849.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12332.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36528.333333333336,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8534.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12288.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781689415768,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1731.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1866.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1336,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11819.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1672.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 859.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4695.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7141.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2151.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2718.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5032.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 524.0666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7465.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11810,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11540.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35847.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7578.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11951,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781774809015,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1725.8666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1840.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1331.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11867.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1663.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 892.5666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4671.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7276.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2260.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2692.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5291.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 530.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7984.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12330.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12133.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36566.86666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8714.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12161.066666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781862450033,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2153.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2353.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1558.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13494.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2095.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 838.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5311.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7901.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2587.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3098.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5726.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 529.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7583.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 14133.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13259.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47022.46666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 9157.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14294.933333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781943330615,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2094.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2297.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1508.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13707.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2103.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 860.9333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5181.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7902.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2568.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3046.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5584.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 531.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7617.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 14261.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13365.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47059.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8348.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13885.966666666667,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782033437269,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1747.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1868.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1337.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11960.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1660.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 884,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4840.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7485.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2337.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2720.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5155.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 497.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7667.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12216.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11836.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36515.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7880.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12207.933333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782124180005,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1858.9333333333336,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2042.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1408.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12193.966666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1843.0666666666664,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 893.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4917.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7867.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2330.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2804.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5376.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 507.76666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8132.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12473.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12180.133333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35915.166666666664,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7732.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12391.566666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782201967404,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1707.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1821.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1315.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11651.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1647.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 869.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4448.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6828.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2210.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2641.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4837.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 504.53333333333336,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7568.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11663.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11719.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36257.36666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7834.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12093.366666666669,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782288195069,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1787.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1896.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1370.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11870.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1722.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 856.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4862.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7637.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2341,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2727,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5085.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 502.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8451.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13136.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11889.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36616.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8604.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12110.933333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782374578807,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1733.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1857.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1355.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12022.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1691.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 880,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4802.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7479.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2325,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2673.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5001.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 511.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8400.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13343.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12200.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36073.46666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7734.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11798.966666666667,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782461426105,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2456.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2643.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1725.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 17761.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2395.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 869.3333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5371,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7660,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 3018.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4138.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5679.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 520.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8640.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 15108.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 15617.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 50558.46666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8985.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 15253.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782546270933,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1829.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1960.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1390.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12180.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1741.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 885.7333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4943.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7711.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2371.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2766.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5348.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 517.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8142.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13094.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12365.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37073.46666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8217.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13877.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782634610370,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1748.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1865.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1367.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11669,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1679,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 835.2666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4688.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7387.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2280.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2664.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5088.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 503.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7702.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12151.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11843.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35423.3,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7736.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11475.166666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782725538894,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2105.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2314.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1491.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13532.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2070.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 830.8333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5133.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7630.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2520.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3034.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5376.7,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 524.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7525.566666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13520.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13241.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47146.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8495.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14064.8,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782807017021,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1707.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1843.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1320.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11994.866666666669,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1682.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 872.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4768.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7089.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2139.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2728.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5321.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 521.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7552.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12250,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12257.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37250.166666666664,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7784.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13618.366666666669,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782896359040,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1718.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1856.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1370.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11929.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1693.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 861.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4911.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7082.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2252.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2724.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5139.566666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 529.3333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7660.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12693.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12020.633333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35959.13333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8915.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13512.433333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782979033439,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2077.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2252.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1422.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12994.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2000.5666666666664,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 832.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5184.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7588.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2493.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2985.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5214.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 501.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7572,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13295,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13234.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46856.26666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8805.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14380.533333333333,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783064958493,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1748.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1903.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1380.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11788.966666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1729.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 866.6333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5037.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7667.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2302.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2730.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5464.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 539.6333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7895.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12283.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12147,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36542.36666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7448.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12542.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783150546765,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1680.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1828.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1316.6333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11641.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1614.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 861.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4609.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7170,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2221.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2643.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5149.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 515.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7691.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12275.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12037.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35979.03333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7735.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13361.833333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783238225510,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1901.6333333333337,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2100.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1427.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11805.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1823.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 860.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4951,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7643.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2347.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2715.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5163.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 506.1333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7538.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12030,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12610.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36925.066666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8274.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12869.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783328543834,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1734.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1840.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1339.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11936.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1631.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 856.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4836.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7516.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2312.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2671.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5054.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 510.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7915.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12258.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11969.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35701.066666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7430.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12434,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783411360600,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1775.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1934.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1361.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11902.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1715.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 878.8333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4916.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7563.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2350.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2750.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5258.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 509.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8486.033333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13107.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12313.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36314,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8325.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12439.8,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783494824274,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1714.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1832.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1312,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11767.866666666669,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1641.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 851.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4840.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7505,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2321.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2664.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5175.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 510.1333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7646.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12249.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12040.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36176.066666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7817.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13273.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783584426790,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2112.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2240,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1467.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12895.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2031.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 845.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5004.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7588.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2505.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3015.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5641.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 525.5666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7849.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13795.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13447.866666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46186.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8601.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13838.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783670671001,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1676.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1813.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1302,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11516.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1615.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 833.8333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4454.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6940,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2239.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2663.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4993.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 498.1333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7632.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12285.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11635.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36531.03333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7410.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11822.166666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783753227849,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2171.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2357.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1517.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13669.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2072.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 830.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5351.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7705.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2579.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3053.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5481.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 525.5666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7625.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13685,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13993.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47241.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8427.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14081.5,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783840795507,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2083.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2271.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1466.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13536.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2030.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 853.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5341.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7975,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2552.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3026.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5503.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 519.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7747.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13389.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13302.633333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46480.63333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8772.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13917.466666666667,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783928241106,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1874.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2074.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1408.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12170.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1822.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 870.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4796.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7402.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2398.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2746,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5305.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 501.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7464.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12050.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13279.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37297.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8395.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12838.366666666669,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784011615724,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2080.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2250.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1472.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13190.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1981.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 822.7333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4597.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6920,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2327.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3018.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4969,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 499.23333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7513.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12927.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13628.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46989.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7940.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12034,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784098128932,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1826,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1958.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1443.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 19005.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1506.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 987.8666666666668,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4724.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 5278.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2562.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4790.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 3744.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 645.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 6755.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 2888.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 9304.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 64175.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 3006.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11331.2,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784185305648,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1662.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1816.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1310.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11474.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1632.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 871.7666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4614.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6975.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2275.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2688.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5021.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 488.23333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7586.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12266.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12164.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36024.26666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7376.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12751.633333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784271905867,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1745.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1866.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1357.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11926.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1672.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 851.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4752.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7370.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2283.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2652.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5307.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 517.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8215.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12691.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12117.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37305.76666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8865.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12276.533333333333,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784357006717,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1718.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1890,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1312.6333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11486.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1647.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 794.3333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4265.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6530.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2135.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2652.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4694.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 511.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7678.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12321.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11146.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35910.53333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7297.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11531.2,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784445288507,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1802.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1945.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1413.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11814.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1721.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 858.2666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4810.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7600.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2308.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2727.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5279.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 518.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7981.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12337.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12138.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36884.63333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8418.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12795.8,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784532774201,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1768.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1877.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1356.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12108.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1666.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 848.5666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4890.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7482.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2383.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2757.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5001.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 493.53333333333336,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8272.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12712.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12299,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37166.63333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8433.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12177.633333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784617996651,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1627.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1792.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1283.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11322.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1570.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 836.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4685.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6504.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2185.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2657.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4536.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 497.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7717.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11780,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11469.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36032.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7503.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11418.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784704298545,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1769.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1900,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1359.8666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11900.033333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1718.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 862.3333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4598.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7179.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2324.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2693.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5408.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 524.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8214.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12977.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12183.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36200.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8245.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11924.866666666669,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784791016221,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1781.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2038.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1388.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12025.433333333332,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1750.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 839.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4873.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7339.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2238.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2783.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5195.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 522.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8094.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12249.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11928.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 37190.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8182.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14228.433333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784877045078,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2148.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2275.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1805.5666666666664,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 17216.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1871.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 969.5666666666668,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4687.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6450.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2070.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3929.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5884,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 638.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7438.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 7910.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 14487.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 60332.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 6390.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13675.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784962977992,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2087.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2301.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1422.8666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13460.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2047.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 848.7666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5130.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7607.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2432.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3031.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5318.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 528.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7685.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13630,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12868.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46522.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8595.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 12512.066666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785050532167,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1812.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1930,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1401.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12140.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1722.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 848.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4866.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7667.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2398.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2755.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5333.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 509.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8238.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12469.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12445.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36685.53333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8125.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13159.1,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785138583820,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1706.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1849.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1327.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11649.633333333331,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1636.6333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 840.9333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4787.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7432.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2207.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2680.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5097.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 516.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8139.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12284.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12053.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36158.36666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8405.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13525.633333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785222632758,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1583.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1860,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1489.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 20322.266666666663,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1707.8666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 1056.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4716.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 4269.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2766.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 5218.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5572.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 672.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5414.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 6395.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12457.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 70490.56666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 6911.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 5597.566666666667,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785309255981,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1714.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1826.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1313.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11821.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1632.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 851.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4745.566666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7272.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2290.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2694.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4969.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 483.53333333333336,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7762.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12016.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11870.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36205.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8016.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11849.766666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785395179344,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1716.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1836.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1313.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11755.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1644.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 877.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4850.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7409.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2277.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2657.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5286.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 513.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7587.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12262.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11874.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35421.933333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7370.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11748.566666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785483056259,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1772.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1898.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1362.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 12017.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1706.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 845.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4761.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7252.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2288.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2679,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4293,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 512.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7927.566666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13013.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12166.133333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35758.76666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7032.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11896.466666666667,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785568596401,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1702.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1828.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1324.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11684.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1620.8,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 844.6333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4813.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7449.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2306.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2695.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5387.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 529.2333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7524.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11950.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36269.666666666664,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7925.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 8993.5,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785655138816,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2066.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2261.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1467.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13515.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2027.0666666666664,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 828.8333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4360.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7740,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2548.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2985.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5653.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 523.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7673.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13516.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13685,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47239.26666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8904.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14290.133333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785743097263,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1766.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1977.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1293.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 18841.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1731.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 933.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5100.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 8078.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2964.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4705.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5755.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 557.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7382.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 10700.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 15279.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 61206.166666666664,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7859.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13926.266666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785827470561,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1927.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2292.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1820.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 17027.966666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1439,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 926.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 3568.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6321.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2531.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4054,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5079.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 693.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 6444.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 9522.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 10646.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 59750.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 6824.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11151.5,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785913686724,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1665.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1820,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1310.6333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11623.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1631.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 839.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4253.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6590.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2195.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2683.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4912.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 500.43333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7493.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11908.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11688.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36454.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7735.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11695,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786000311233,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1722.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1834.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1334.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11903.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1656.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 867.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4796.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7435,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2252.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2711.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5044.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 520.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7783.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12281.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11925.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36553.63333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7826.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13279.433333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786083180837,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2153.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2357.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1519.7,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13688.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2092.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 836.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5242.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7774.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2582.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3044.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5520.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 528.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7748.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13921.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 14020.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47683.73333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 9384.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13138.633333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786167346490,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2073.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2305,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1498.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13316.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2046.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 814.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4296.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6829.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2397.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3021.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5687.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 548.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7536,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13732.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13596.866666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46601.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8742.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14302.366666666669,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786254248171,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2176.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2370,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1522.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13538.133333333331,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2102.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 858.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5080.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2543.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3003.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5597.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 534.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7479.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13678.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13260.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46449.36666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8677.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13488.7,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786341727149,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1747.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1896.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1349,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11830.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1686.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 865.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4695.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7090.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2234.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2678.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4831.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 509.03333333333336,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7603.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12324.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11235.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36024.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7614.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11262.633333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786427257506,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2109.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2325.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1499.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13628.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2059.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 853.7333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5112.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7635,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2509.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3056.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5641.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 530.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7693.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13942.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13513.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46873.26666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 9467.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13587.033333333333,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786515129627,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2107.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2295,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1502.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13539.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1935.5666666666664,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 851.9333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4945.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7510,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2501.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3028.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5395.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 515.5666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7755.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13250,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13156.866666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46215.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8146.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14157.4,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786601750953,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1657.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1923.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1807.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 16881.166666666668,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1584.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 903.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 2949.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 4419.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 1205.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3962,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 3400.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 472.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 2994,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 5247.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 6647.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 59415.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 3571.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 6800.1,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786687950892,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1722.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1850,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1345.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11722.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1615.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 853.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4900.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7679.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2270.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2715.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4805.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 508.93333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7572.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11306.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11554.633333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36935.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7940,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13055.6,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786770098052,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1687.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1810.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1328.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11752.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1616,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 852.6333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4771.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7217.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2261.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2703.766666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5078.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 516.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7588.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12181.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12120.3,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36593.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7670.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13113.466666666667,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786856843041,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1699.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1820,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1313.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11821.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1653.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 864.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4813.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7340.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2279.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2681.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5182.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 526.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7769.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12355,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12019.566666666668,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35617.26666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7398.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11694.666666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786943433033,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2079.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2319.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1501.6333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13359.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2043.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 813.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5271.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7399.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2448.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2979.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5358.3,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 525.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7529.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13595.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13069.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46792.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8048.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11244.933333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787029617387,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1265.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2329.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1968.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 22534.966666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1511,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 1034.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 2924.233333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 4736.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 1252.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 5816.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4525.566666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 864.7666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 4010.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 4661.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 6661.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 80443.66666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 2398.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 8787.066666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787116025680,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1711.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1821.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1317.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11757.133333333331,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1639.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 856.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4793.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7460.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2291.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2672.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5202.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 518.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7842.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12388.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12142.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36352.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7340.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11949.233333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787202408297,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2098.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2308.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1497.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13591.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2023.7,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 816.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5139.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7490,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2413.266666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3037.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5567.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 531.3333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7753.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13978.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13362.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46514.666666666664,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8742.066666666668,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14271.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787289101390,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2181.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2382.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1541.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13672.433333333332,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2126.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 826,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5321.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7812.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2560.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3063.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5733.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 539.9333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7798.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 14205.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13929.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46709.2,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8516.966666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14203.633333333331,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787375043552,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1717.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1875.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1369.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11762,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1674.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 863.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4223.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6675,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 1885.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2603.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4812.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 534.7666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7593,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11616.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12062.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 34857.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7272.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11331.433333333332,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787461760839,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1659.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2030.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1498.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 21896.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1576.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 1153.5333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4080.733333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 5805,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 1990.7666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 5473.466666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4440.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 670.7,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5542.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 6982.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11876.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 76125.3,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7059.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11074.866666666669,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787548448210,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1694.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1845,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1314.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11392.366666666669,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1628.6,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 830.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4452.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6720,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2184.5,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2666.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4730.5,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 509.3666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7581.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 12260,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11693,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36260.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7667.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13143.666666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787634534771,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1467.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1832.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1373.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 18219.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1560.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 943.3666666666668,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 3190.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 4049.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 1564.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4591.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4098.566666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 604.2333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 5610.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 5826.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 8291,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 60228.86666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 5210.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 7938.733333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787721047003,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1689.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1830.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1317.6333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11465.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1625.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 855.4333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4547.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7209.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2196.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2639.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4822.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 590.7333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7619.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11989.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11578.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35489.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7690.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11533,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787844169870,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2135.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2333.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1509.5666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13556.1,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2066.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 815.9,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5180.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7870,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2461.6666666666665,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3019,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5289.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 530,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7693.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 14036.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13168.233333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 47466.53333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8618.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13891.666666666666,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787934783566,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1688.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1820.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1322.3333333333333,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11770.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1613.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 846.1333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4711.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7394.166666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2264.6,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2680.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5121.633333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 519.2333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7640.866666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11860.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11905.9,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36634.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7597.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11466.233333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788002202053,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1635.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1800,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1343.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11535.5,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1621.3666666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 822.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4246.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6728.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2279.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2705.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5237.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 528.2666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7531.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11815,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11834.633333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36666.433333333334,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8005.7,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13413.833333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788085431155,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1773.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1900.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1372.2333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11799.766666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1681.9333333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 828.7666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4800.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7312.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2244.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2675.1666666666665,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5162.4,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 528.9333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8226.4,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13075,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12140.433333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36599.6,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8524.033333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 11969,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788173830712,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1995.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2193.3333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1543.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 14097.4,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1832.4333333333336,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 825.6666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4205.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6171.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2034.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3086.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4515.2,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 530.1333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7606.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 8360.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12921.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 54780.73333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 6499.033333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13413.066666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788256139486,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1807.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1995,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1366.2666666666669,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11742.866666666669,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1720.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 849.8666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4544.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7091.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2193.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2653.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 4995.066666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 484,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7573.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11858.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 12196.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 35662.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7800.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13277.566666666668,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788339818430,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1781.1666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1905,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1365.4,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 11953.433333333332,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1705.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 875.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4914.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7428.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2288.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 2689.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5180.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 521.5,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 6859.433333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 9619.166666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 11059.2,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 36418.86666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8163.966666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13618.9,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788426772473,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2345.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2580.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1663.7333333333331,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 17158.466666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2295.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 895.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5303.666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7725,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 3043.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4113.7,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5579.1,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 532.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 8454.433333333332,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13857.5,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 16247.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 51295.566666666666,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8810.933333333332,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 15498.6,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788513026870,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2068.2,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2260,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1455.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 13290.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1974.4333333333336,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 822.0666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4970.1,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 7355.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2397.8,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 3036.8,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5465.733333333334,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 538,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7418.8,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 13461.666666666666,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 13175.1,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 46785.96666666667,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8650.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 14101.333333333334,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788598149082,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 1432.4333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 1985.8333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1401.4666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 18512.233333333337,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 1832.6666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 984.0333333333332,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 4793.133333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 6715.833333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 2315.0666666666666,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 4792.933333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 5191.266666666666,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 549.0333333333333,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7498.533333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 8700,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 15412.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 62184.03333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 7240.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 13995.3,
            "unit": "ops/s"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788685374536,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/peak-throughput",
            "value": 2050.366666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/sqlite/batch-25/peak-throughput",
            "value": 2350.8333333333335,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/sqlite/peak-throughput",
            "value": 1581.1333333333334,
            "unit": "ops/s"
          },
          {
            "name": "reads/sqlite/peak-throughput",
            "value": 21135.133333333335,
            "unit": "ops/s"
          },
          {
            "name": "overload/sqlite/peak-throughput",
            "value": 2104.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "mixed/sqlite/peak-throughput",
            "value": 1075,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/peak-throughput",
            "value": 5623.3,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/postgres/batch-25/peak-throughput",
            "value": 8768.333333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/postgres/peak-throughput",
            "value": 3485.9666666666667,
            "unit": "ops/s"
          },
          {
            "name": "reads/postgres/peak-throughput",
            "value": 5365.333333333333,
            "unit": "ops/s"
          },
          {
            "name": "overload/postgres/peak-throughput",
            "value": 6555.9,
            "unit": "ops/s"
          },
          {
            "name": "mixed/postgres/peak-throughput",
            "value": 577.0666666666667,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/peak-throughput",
            "value": 7635.6,
            "unit": "ops/s"
          },
          {
            "name": "post-one-book/log/batch-25/peak-throughput",
            "value": 11680.833333333334,
            "unit": "ops/s"
          },
          {
            "name": "post-many-books/log/peak-throughput",
            "value": 16830.866666666665,
            "unit": "ops/s"
          },
          {
            "name": "reads/log/peak-throughput",
            "value": 71907.9,
            "unit": "ops/s"
          },
          {
            "name": "overload/log/peak-throughput",
            "value": 8743.533333333333,
            "unit": "ops/s"
          },
          {
            "name": "mixed/log/peak-throughput",
            "value": 17516.7,
            "unit": "ops/s"
          }
        ]
      }
    ],
    "bench-nightly-smaller": [
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "70494f577e6e3ccafdb36b2d78b34011690d88f4",
          "message": "Merge branch 'fix/sqlite-begin-immediate'",
          "timestamp": "2026-06-05T05:20:15Z",
          "url": "https://github.com/mooze-labs/talea/commit/70494f577e6e3ccafdb36b2d78b34011690d88f4"
        },
        "date": 1780639746407,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8163,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 6923,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1395,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7383,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 77695,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4783,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7143,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133887,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 984063,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 15967,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 11079,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4215,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7359,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 67071,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 18591,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 14079,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 13383,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 325375,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "3f0da95680e6a65910d3fed3b90e284f4e09dbdf",
          "message": "style: cargo fmt over the store-log merge (mainline Format gate is red)",
          "timestamp": "2026-06-05T14:07:33Z",
          "url": "https://github.com/mooze-labs/talea/commit/3f0da95680e6a65910d3fed3b90e284f4e09dbdf"
        },
        "date": 1780672311504,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9535,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11167,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1488,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7631,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82175,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4207,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6571,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133631,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 887295,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6979,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7987,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4219,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7235,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 69951,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31039,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 20751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19247,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 855039,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2779,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2427,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 743,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3085,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 732,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1014,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1898,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2385,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1059,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "5ab65e8e312cc4004481f0cd28729bd28c717d7c",
          "message": "fix(server): pool-acquire timeout answers backpressure (429), not 500",
          "timestamp": "2026-06-05T16:03:13Z",
          "url": "https://github.com/mooze-labs/talea/commit/5ab65e8e312cc4004481f0cd28729bd28c717d7c"
        },
        "date": 1780679444133,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9367,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11623,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1478,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7367,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83519,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4009,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6467,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132863,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 967167,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6735,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7755,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4139,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6263,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 63135,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34975,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 33439,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 23407,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 857087,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2943,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2547,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 752,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3101,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 727,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 997,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1849,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2727,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1021,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "committer": {
            "name": "havis",
            "username": "h4vismat",
            "email": "h4vismat@mooze.app"
          },
          "id": "24c3eac15a0c284730e3df953c05f45833b3fcc6",
          "message": "Merge remote-tracking branch 'origin/main'",
          "timestamp": "2026-06-06T04:19:00Z",
          "url": "https://github.com/mooze-labs/talea/commit/24c3eac15a0c284730e3df953c05f45833b3fcc6"
        },
        "date": 1780731866690,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9159,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7415,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1511,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7387,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82879,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4259,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6443,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 943615,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6559,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7479,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4263,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7203,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71359,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29711,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23967,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19215,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 847871,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2501,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2165,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 768,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3001,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 741,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1043,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1920,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2269,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1074,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-07T00:15:20Z",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780820428882,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8247,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 114751,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7011,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1433,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7567,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 76991,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4147,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6899,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134911,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1090559,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6167,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33535,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6743,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3805,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6683,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65183,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30719,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22383,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18527,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1051647,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1999,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 21343,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1910,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 616,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2859,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 578,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1174,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2141,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2365,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1168,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-07T00:15:20Z",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780910967624,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9703,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 144255,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 13239,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1531,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7519,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79231,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4223,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6503,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133887,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 988159,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7231,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35359,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7959,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4243,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7215,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71487,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 41055,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21423,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21775,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1036287,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3333,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 21023,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2859,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 775,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3055,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 746,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1155,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2083,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2935,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1152,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "123232ca7ab73fb3fe46bce672a8b2c4817c4682",
          "message": "Merge worktree-bench-publish-false: mark talea-bench publish = false\n\nbuild: mark talea-bench publish = false",
          "timestamp": "2026-06-07T00:15:20Z",
          "url": "https://github.com/mooze-labs/talea/commit/123232ca7ab73fb3fe46bce672a8b2c4817c4682"
        },
        "date": 1780992283890,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8791,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 138111,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7803,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1458,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7139,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 84223,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4851,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7443,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132351,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1130495,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6051,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33663,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7027,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4183,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7119,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71487,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 33503,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 49311,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21871,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1059839,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1888,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22207,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1841,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 762,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2933,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 735,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1081,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1980,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2301,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1122,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781079851264,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9119,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147455,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10231,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1513,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7419,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82751,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4227,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6363,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135039,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1019391,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6987,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36639,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8003,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4299,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7347,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70463,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34303,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 27599,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22351,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1072127,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3043,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26495,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2839,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 784,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2859,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 771,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1061,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1924,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2583,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1089,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781169765094,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9239,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142975,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8759,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1517,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7595,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83071,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4651,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6955,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133631,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1016831,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7467,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36927,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8559,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4255,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7247,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72575,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 56383,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 41183,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22719,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 998911,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3443,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22367,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3241,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 770,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3019,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 743,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1058,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1926,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2629,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1037,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781255333524,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9151,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 146815,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11287,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1550,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7543,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83519,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4595,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6711,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180351,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1004031,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6879,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37119,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7907,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4323,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7183,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71359,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 26367,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21231,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 996863,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2919,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22831,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2723,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 780,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2977,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 756,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1046,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1854,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2467,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1063,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781338402264,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9311,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 140159,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9975,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1533,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7487,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82623,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4199,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6815,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133375,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1074175,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7327,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37215,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7411,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4343,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7227,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 73151,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 37599,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 26863,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21311,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1042943,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2141,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22575,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2069,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 787,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2863,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 764,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1044,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1909,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2219,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1044,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781427820283,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9159,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 114943,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7383,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1404,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8091,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 80191,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3955,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6935,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134271,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1088511,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6287,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36415,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7627,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4283,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7347,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 64895,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32015,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 34847,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21039,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 986111,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2285,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 38047,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2447,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 620,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2929,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 610,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 996,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1841,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2125,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1039,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781520246956,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9871,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 141055,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 12783,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1501,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7359,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81023,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4359,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6503,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134015,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 985087,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6959,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36703,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7551,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4187,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7079,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72639,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 40543,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 28303,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20687,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1045503,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2455,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22367,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2387,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 771,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2837,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 737,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1020,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1840,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2469,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1011,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "2cac36b81d55bacf258cdb44d4d64928451d51b6",
          "message": "Merge worktree-client-bump-0-1-1: release talea-client 0.1.1\n\nrelease: talea-client 0.1.1",
          "timestamp": "2026-06-09T11:18:14Z",
          "url": "https://github.com/mooze-labs/talea/commit/2cac36b81d55bacf258cdb44d4d64928451d51b6"
        },
        "date": 1781604678783,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9239,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142719,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7803,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1532,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7519,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82175,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4227,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6751,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132735,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 997887,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6335,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35615,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7315,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4291,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7183,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70527,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34559,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 34207,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22015,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1035775,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2024,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 21135,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1978,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 766,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2973,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 745,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1063,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1916,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2231,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1064,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781689418521,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9823,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145151,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 36831,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1507,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7443,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83135,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4231,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7179,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 995839,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7699,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38367,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9327,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4323,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7503,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72767,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 35551,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 29359,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21087,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 961535,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3171,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23279,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2921,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 810,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3035,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 768,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1037,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1899,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2645,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1074,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781774811053,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9399,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 146175,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 21359,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1506,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7487,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82751,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3831,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6747,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135423,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 991743,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7539,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37119,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8191,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4343,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7195,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72703,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32799,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 25231,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19663,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 983039,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3241,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24031,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2729,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 763,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2937,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 736,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1046,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1906,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2595,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1077,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781862451733,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 7987,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 113919,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8023,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1446,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7655,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 78783,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4259,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6847,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132479,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1146879,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6051,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 32863,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6595,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3829,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6707,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 64831,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32079,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 37183,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19615,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1059839,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1638,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23679,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1692,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 599,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3063,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 587,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 980,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1844,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1966,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1012,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1781943332343,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8223,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 117631,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7691,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1413,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7495,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81151,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 5171,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7291,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 131711,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1119231,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5611,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 32959,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6451,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3827,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6759,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 63647,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 42911,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 34911,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21471,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1050623,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1684,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 43903,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1840,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 588,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2941,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 569,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1067,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1978,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2123,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1070,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782033439171,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9807,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 144255,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10903,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1537,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7211,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83327,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4047,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6315,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 136063,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1010687,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8543,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36191,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9167,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4327,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7219,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70079,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31759,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 26607,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22191,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1042431,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4027,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26927,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3661,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 785,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2953,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 749,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1013,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1848,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3163,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1026,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782124181938,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10239,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 133631,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10983,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1496,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7215,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82431,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4195,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6663,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132735,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1052671,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 9071,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34079,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7611,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4247,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7255,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70783,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30927,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 20655,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20239,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1083391,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3605,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26991,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3235,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 793,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3055,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 759,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 946,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1727,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2979,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 959,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782201969199,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9887,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 149247,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9439,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1538,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7491,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83583,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3979,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6363,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133631,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1007615,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8043,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39647,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8847,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4371,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7507,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71679,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 36639,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 27935,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20239,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1007103,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4015,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 29871,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3559,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 792,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3079,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 754,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1014,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1846,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2929,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1008,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782288197253,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9431,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 141823,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8155,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1496,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7235,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82943,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4131,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6323,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134911,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1023999,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7515,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34591,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8003,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4327,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7299,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 73151,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 41919,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 48959,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21119,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1051647,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2971,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22143,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2805,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 764,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3019,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 736,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1066,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1906,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2507,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1068,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782374581293,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9351,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145535,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11239,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1517,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7327,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81983,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4215,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6439,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133631,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1007615,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6679,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35679,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7827,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4323,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7363,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70079,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 36223,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23455,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20463,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1014271,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2413,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 20527,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2119,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 801,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3051,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 767,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1075,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1967,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2261,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1086,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "474a8c2694e4ed5bdc3f1287c027720782cbba4d",
          "message": "Merge worktree-talea-service-extraction: extract talea-service embeddable ledger engine\n\nExtract LedgerService into talea-service (embeddable ledger engine)",
          "timestamp": "2026-06-17T07:43:50Z",
          "url": "https://github.com/mooze-labs/talea/commit/474a8c2694e4ed5bdc3f1287c027720782cbba4d"
        },
        "date": 1782461429239,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 7367,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 101375,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 5843,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1047,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7739,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82495,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3609,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7319,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 129727,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1496063,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5143,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34207,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 5207,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2805,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6039,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 83519,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 49471,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 31935,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22015,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1242111,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1606,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 104319,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1449,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 559,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2733,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 531,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 832,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1600,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1713,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 844,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782546273605,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9135,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 138367,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 13071,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1506,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7395,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81727,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4419,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7015,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134015,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1040895,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6287,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33791,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6995,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4243,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7103,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 69567,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 39743,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 32511,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21407,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1032703,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1948,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 19119,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1842,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 751,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2777,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 724,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1029,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1866,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2105,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1075,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782634611987,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9743,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147071,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8631,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1562,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7559,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81855,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4499,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6659,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132991,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1044991,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7543,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36383,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8663,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4391,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7295,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70783,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 48095,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 32255,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 26159,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 991231,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3929,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 51231,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3591,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 800,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2865,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 771,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1059,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1913,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2969,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1107,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782725540623,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8607,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116991,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7203,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1329,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7767,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 80063,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4355,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6843,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135039,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1154047,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5795,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35391,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6767,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4247,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7259,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 66559,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34175,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21727,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19327,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1060863,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2177,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 44831,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2137,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 604,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2963,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 575,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1078,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1951,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2295,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1089,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782807019122,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10191,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148095,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11407,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1531,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7579,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83263,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4163,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6495,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132991,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1023487,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8895,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39871,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9031,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4347,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7227,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70335,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30783,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 28047,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20223,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1063935,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3843,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22239,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3425,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 782,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3047,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 759,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1083,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1989,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3071,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1110,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782896360732,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9455,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145407,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11591,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1542,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7655,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81215,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4291,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 5867,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134911,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1002495,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6767,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38367,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7639,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4271,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7239,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 69375,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 26431,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 43455,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 23119,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 979967,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2351,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 21391,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2485,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 795,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3169,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 767,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1059,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1955,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2305,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1030,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1782979035203,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8543,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 119231,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11143,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1461,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7987,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79423,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4467,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6711,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180991,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1081343,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7359,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37567,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6879,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4195,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7079,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 66303,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 33439,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 24367,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20703,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1049599,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2259,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 21439,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2147,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 637,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2873,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 574,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 993,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1835,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2121,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1009,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783064960120,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9343,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 143487,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7675,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1532,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7655,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82367,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4455,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6875,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134399,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1001983,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7971,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35679,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8335,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4287,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7147,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 85951,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29679,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23599,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19343,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 996351,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3953,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27727,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3639,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 761,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2983,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 741,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1055,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1946,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3067,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1080,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783150548745,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9879,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148223,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 36095,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1542,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7655,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81919,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4083,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6407,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134399,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 982015,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8431,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38047,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9447,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4443,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7371,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72127,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 28943,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21327,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20207,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 997887,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3863,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24383,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3063,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 783,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3029,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 780,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1063,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1932,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2877,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1103,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783238227183,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9903,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 129471,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 14191,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1516,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7639,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81023,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4395,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6571,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133119,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1076223,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7179,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35007,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8143,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4303,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7279,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72127,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31007,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 36863,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21599,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1028095,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3921,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23887,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3393,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 759,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3027,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 734,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 901,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1593,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2653,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 907,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783328546464,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9383,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148863,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11959,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1519,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7655,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81407,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4335,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6763,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133375,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 966143,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6911,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36223,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7875,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4375,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7383,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71039,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29695,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 34527,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22847,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1056767,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2705,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22735,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2471,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 790,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3017,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 775,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1160,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2034,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2493,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1142,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783411362337,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9807,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 140671,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11095,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1510,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7631,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 80319,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4267,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6719,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 997887,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6231,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34591,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7459,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4251,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7175,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71487,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 41599,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22639,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20671,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1045503,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2012,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 20463,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2145,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 763,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3047,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 738,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1022,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1866,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2325,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1032,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783494826029,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9623,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 146815,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11727,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1552,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7659,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81215,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3973,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6203,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135679,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 959999,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7883,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36159,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8519,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4387,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7339,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70655,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31599,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 45663,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22479,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1031167,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3447,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24591,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3091,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 782,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3081,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 763,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1051,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1925,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2899,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1083,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783584429190,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8415,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 121855,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11583,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1475,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8231,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 78975,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4483,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6471,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180223,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1099775,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6359,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35231,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6843,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4103,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6691,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65727,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 39583,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 33663,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19743,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1020927,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1895,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 18927,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1843,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 604,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2989,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 612,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1256,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2201,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2677,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1304,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783670674224,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10167,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148735,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9175,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1531,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7939,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 84031,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4093,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6463,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 136447,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 987135,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 11175,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 41311,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 11343,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4439,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7339,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72703,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 44191,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 26239,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22911,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 996863,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3579,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27503,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3947,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 762,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3003,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 749,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1016,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1887,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 4073,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1053,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783753229563,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8191,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 115007,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8823,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1310,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7747,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79551,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4831,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7823,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 146687,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1123327,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5467,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 50591,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6367,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3937,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6675,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 64383,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 43903,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 34591,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19519,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1022975,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1580,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 25647,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1660,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 581,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2677,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 573,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 967,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1709,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1917,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 980,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783840797881,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8215,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 118079,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7195,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1461,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7743,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79039,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3911,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6359,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132479,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1085439,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5875,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 32687,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6951,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3839,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6643,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 63295,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31167,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23663,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18847,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1062911,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2157,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 104063,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2011,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 600,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2883,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 584,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1003,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1798,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2097,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1024,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1783928242998,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10079,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 131199,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11807,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1493,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7427,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83199,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4107,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6891,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132735,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1070079,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7583,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36319,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8303,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4199,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7047,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71359,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32047,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 24527,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20255,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1047551,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4061,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24687,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3723,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 749,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2803,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 723,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 854,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1544,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3123,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 856,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784011617511,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8615,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 119871,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8319,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1368,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7671,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79743,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4255,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6919,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180735,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1118207,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5691,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38975,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6923,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3997,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7087,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 63967,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 38975,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 29263,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22639,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1023999,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1837,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 77375,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1793,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 622,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3121,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 588,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1007,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1981,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2085,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1030,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784098132181,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 98815,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 310527,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 82559,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1082,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8199,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 66559,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3205,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6439,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 131711,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 653311,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 91775,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 294399,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 297983,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2669,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5691,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 67135,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 118015,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 66623,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 214015,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 473343,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 38079,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 1051647,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 6483,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 440,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2531,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 425,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 693,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1338,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 8359,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 716,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784185308793,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10159,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148863,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8215,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1554,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7531,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81983,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4307,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6543,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133375,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 956415,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7471,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39359,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8303,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4355,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7255,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71103,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 36063,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 35167,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22671,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 995327,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3243,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 28815,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2711,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 781,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2987,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 761,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1060,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1884,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2707,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1050,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784271908088,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9343,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 146943,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9359,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1552,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7711,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82495,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4463,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6427,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134399,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1004031,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6379,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35935,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7575,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4435,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7491,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 69503,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29391,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22927,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18767,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1054719,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2211,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 20639,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1970,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 769,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2977,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 743,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1057,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1874,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2151,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1065,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784357009514,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9935,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142079,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 14327,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1545,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8035,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81663,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4811,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7363,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 181375,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 996863,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8039,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 42015,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8983,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4447,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7723,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 74367,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 37311,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 26927,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21791,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 889855,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3555,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 68287,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3307,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 804,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3043,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 773,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1066,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1970,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3025,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1086,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784445291104,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9063,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 139391,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8943,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1512,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7583,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81279,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3977,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6831,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134143,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1038847,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7167,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35487,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7991,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4323,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7279,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72639,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32799,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 25039,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19999,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1028095,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3097,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 34079,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2787,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 761,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2855,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 742,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1088,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1912,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2605,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1086,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784532776142,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9463,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 144639,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8871,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1500,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7791,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82943,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4435,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7271,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135295,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 996351,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6579,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36575,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7347,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4199,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7167,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71935,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 35807,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 25919,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20735,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1064959,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2073,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26895,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2311,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 759,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3009,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 744,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1088,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1990,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2321,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1121,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784617999059,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10111,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 151295,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8559,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1588,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 9591,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 89087,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3947,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6347,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180479,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 964607,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7087,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 47039,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9407,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4411,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7439,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72319,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 42751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 43583,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 24431,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 911871,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2561,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24463,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2345,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 805,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3007,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 776,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1084,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1953,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2427,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1109,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784704300579,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9431,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 141439,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8143,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1509,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7931,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81407,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4367,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6539,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135295,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1042431,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6791,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37087,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7355,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4379,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7407,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 87167,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30911,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 28015,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19967,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1039359,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2413,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27327,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2123,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 782,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2949,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 751,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1046,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1901,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2373,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1074,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784791018348,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10263,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 134271,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 12111,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1514,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7719,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82303,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4427,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7595,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 137727,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1043967,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 11383,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38591,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 10207,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4527,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7499,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70719,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29551,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21167,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20927,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 945151,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3713,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 30351,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3481,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 750,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2811,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 720,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 961,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1765,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2709,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1012,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784877047218,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 28703,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 315135,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 84479,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1134,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 6115,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 61887,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3997,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6287,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132095,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 788991,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 78335,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 228735,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 110911,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3323,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5519,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 51231,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 35071,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22127,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 53855,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 659967,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 17711,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 377343,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 19903,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 463,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2505,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 444,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 813,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1459,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2931,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 843,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1784962980243,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8423,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116799,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8431,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1442,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8431,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 80191,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4695,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7031,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 137727,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1100799,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5683,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34719,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6607,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3871,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6871,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65791,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30847,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 30991,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19087,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1061887,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1719,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 24111,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1708,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 593,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2887,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 583,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1114,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2012,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2203,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1147,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785050534074,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8895,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 139903,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7839,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1502,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7611,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81471,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4543,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7207,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133503,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1047039,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6347,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34463,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7267,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4247,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7091,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 69567,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 28175,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22879,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19359,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1086463,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2203,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 25215,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2034,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 779,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3043,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 746,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1043,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1901,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2277,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1061,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785138585738,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9663,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 145919,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8287,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1544,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7839,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82239,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4319,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6539,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180479,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1009151,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6791,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35647,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7655,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4371,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7315,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72703,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34143,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 26847,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20911,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 980479,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2203,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22191,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2087,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 770,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2935,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 743,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1134,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2053,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2435,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1167,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785222635874,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 60671,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 371199,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 104767,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 967,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7611,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 59391,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3063,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 5715,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 129919,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 600063,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 126015,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 376063,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 119935,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2393,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5271,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 59711,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 82175,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 43583,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 166655,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 428543,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 58527,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 318463,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 172287,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 404,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2301,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 388,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 676,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1326,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 47391,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 706,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785309258320,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9511,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147711,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11071,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1540,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7771,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81535,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4463,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6975,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 181119,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 995839,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8711,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38175,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9631,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4367,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7263,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70335,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 35935,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 30479,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22223,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1016831,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4307,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27071,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3887,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 779,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3013,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 745,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1018,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1848,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3281,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1056,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785395182189,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9871,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147967,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10807,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1556,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7807,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83327,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4195,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6611,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135295,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 976895,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8295,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37247,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8903,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4387,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7279,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 85887,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 36031,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 30799,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22495,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 982527,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4227,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26447,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3873,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 785,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3129,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 769,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1058,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1952,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3399,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1077,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785483059298,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9863,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142719,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 12151,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1525,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7735,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 81983,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4631,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6939,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132863,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 993791,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 9407,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39935,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9015,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4379,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7515,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71359,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 38207,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23039,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20591,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1018367,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3329,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22895,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3109,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 787,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2981,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 749,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1641,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2843,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 4263,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1588,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785568598560,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9575,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147711,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 13567,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1559,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7767,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83199,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4267,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6935,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 999935,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7995,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37407,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8775,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4335,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7291,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 88383,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 33919,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21967,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20351,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 974335,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3721,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23183,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3309,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 778,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3053,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 751,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1587,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2615,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3505,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1667,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785655140780,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8367,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 119103,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11375,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1348,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8031,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79615,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4571,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6803,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135039,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1100799,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8047,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33823,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7503,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4215,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7115,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 64351,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31119,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 25231,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20143,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1018367,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2449,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 21791,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2207,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 584,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2905,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 568,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1074,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1909,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2355,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1116,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785743100175,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 25247,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 153983,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 85183,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1056,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8399,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 64799,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3481,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6491,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132095,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 820223,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5679,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34655,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 5947,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2627,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5855,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 67199,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 64031,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 34463,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 26351,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 943103,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2179,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 31247,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2025,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 472,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2579,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 446,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 808,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1534,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2231,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 813,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785827473624,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 52223,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 319487,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 57247,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1063,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 6211,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 62431,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3897,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6151,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132351,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 771583,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 168703,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 227327,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 117183,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3233,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5811,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 56095,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 45439,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 29055,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 120959,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 829951,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 58047,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 201599,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 42399,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 457,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2275,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 441,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 751,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1348,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 70591,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 848,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1785913689791,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10087,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148095,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10463,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1546,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7707,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83327,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4119,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6547,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 181119,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 987647,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 9567,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 41983,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9407,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4443,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7411,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 73535,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32367,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22463,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20607,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 973311,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3917,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 30047,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3449,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 787,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3055,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 754,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1034,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1928,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3075,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1031,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786000313498,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9535,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 146943,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8735,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1536,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7771,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82687,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4029,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6263,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 181247,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 992767,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7311,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36511,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7967,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4363,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7263,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70975,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30319,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 20879,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19343,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1022463,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2705,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22559,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2507,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 799,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3061,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 755,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1069,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1962,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2541,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1087,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786083182903,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8231,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 114559,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7743,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1324,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7755,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 78911,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4831,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6579,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132991,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1115135,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6095,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34879,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6519,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3839,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6607,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 66111,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30335,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 29967,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20783,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1055743,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1677,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 83455,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1664,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 578,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2787,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 565,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 994,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1809,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1961,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 998,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786167348752,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8359,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116607,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7275,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1465,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8123,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79167,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4707,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7231,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1110015,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 9687,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 43551,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9895,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4515,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7511,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 63967,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29727,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 20415,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18127,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 985599,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1899,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27487,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1836,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 597,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2727,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 573,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1066,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1923,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2163,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1105,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786254250476,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 7947,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 113599,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 6511,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1450,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7679,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79359,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4343,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6707,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 181503,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1115135,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5767,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 34431,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6687,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3911,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6783,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 63807,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 35135,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23055,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19487,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1032703,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1830,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 33535,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1935,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 588,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2823,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 571,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1125,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2008,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2363,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1086,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786341730246,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9927,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142719,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 13271,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1526,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7851,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82687,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3943,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6523,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134655,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1032703,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8255,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38591,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8583,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4531,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7555,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72511,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 33535,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 41855,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21503,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 986623,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4215,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27583,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3879,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 813,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3089,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 797,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1105,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2085,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3403,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1077,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786427259764,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8199,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116287,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 6431,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1352,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7915,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79167,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4319,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6339,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134143,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1097727,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6459,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36831,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6687,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4095,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6711,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65855,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34783,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 24815,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18927,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1019391,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1786,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 54655,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1751,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 586,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2691,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 567,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1006,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1819,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1983,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1004,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786515132461,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8191,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116671,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7943,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1354,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8003,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 78015,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4655,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7103,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 138751,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1090559,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6195,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36511,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6647,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3867,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6739,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 64063,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34463,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 27119,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20255,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1012735,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1773,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 25727,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1724,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 601,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2899,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 584,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 983,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1760,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1931,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 966,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786601755006,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 193791,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 540159,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 60127,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1155,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 6251,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 63583,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4239,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6527,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134399,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 595455,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 152703,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 402687,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 332031,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3191,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5467,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 49823,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 110975,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 94207,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 218879,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 278783,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 77375,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 311551,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 162815,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 447,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2259,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 436,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 580,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1091,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 206079,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 593,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786687954220,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9743,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 155135,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10671,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1694,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7843,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83007,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4291,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7147,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180735,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1030655,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7903,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37023,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9223,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4319,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7163,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 73087,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 27759,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 29087,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21679,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1044991,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3979,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 25471,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3667,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 774,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2999,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 748,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1032,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1881,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3153,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1031,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786770100441,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9511,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 150015,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10279,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1535,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7859,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82111,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4751,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7219,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180863,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 994303,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7171,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 39263,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8091,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4335,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7347,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72191,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31407,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 32335,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19727,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 987135,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3225,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 25823,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3333,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 781,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3077,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 750,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1055,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1920,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2633,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1075,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786856845548,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9799,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 149119,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8887,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1537,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7867,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83007,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4335,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6347,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180479,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 975359,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6995,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37471,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8163,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4379,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7403,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 86911,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 38463,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 32703,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20239,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 963071,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2811,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23423,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2503,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 789,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2971,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 759,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1124,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1981,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2463,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1106,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1786943435891,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8247,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 115903,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8079,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1446,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8003,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 78719,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4427,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6831,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 135679,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1122303,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5679,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 41631,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 7015,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3975,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7247,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65311,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 33087,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 18895,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 22351,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1021439,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1868,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 47999,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1849,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 606,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2859,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 617,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1567,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2657,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2997,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1660,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787029621255,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 188799,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 415743,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 79935,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 894,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 6519,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 51455,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3325,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6059,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 130175,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 548351,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 201343,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 372735,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 157951,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2189,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 4567,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 45631,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 186751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 143999,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 330751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 250623,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 172159,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 296191,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 367359,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 352,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2006,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 346,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 565,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1080,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 157311,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 575,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787116028139,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9695,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148095,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8959,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1547,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7795,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83455,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4495,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6795,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133631,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 998911,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7659,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36927,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8447,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4403,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7311,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 72639,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31407,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23871,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20223,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1036799,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3771,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 22847,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3493,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 788,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2997,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 760,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1064,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1922,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3269,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1037,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787202410948,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8455,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 116159,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7715,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1344,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7879,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79551,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4747,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7287,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 138111,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1140735,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5639,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35423,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6795,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4271,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6939,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 66687,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 32063,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19567,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1010687,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2087,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27135,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1934,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 591,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2887,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 574,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1002,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1830,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2055,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1064,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787289103881,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8083,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 112319,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 6839,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1313,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7795,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79039,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 5023,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7159,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180351,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1154047,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5419,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 33727,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6539,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3833,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6555,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65503,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29695,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21439,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19295,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1036287,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1672,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 18783,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1744,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 587,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2815,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 569,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 961,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1764,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1913,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 979,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787375045991,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9791,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 143743,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9151,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1525,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7691,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 84415,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4279,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6931,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 136703,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1043967,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8863,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 44575,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9919,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4515,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 8015,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 75135,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29679,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 25103,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20991,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 848383,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4077,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 29935,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3247,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 773,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3019,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 759,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1117,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 2127,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2933,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1122,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787461763750,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 104639,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 248831,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 94271,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 915,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 6647,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 51167,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3043,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 5087,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 111167,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 574463,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 84287,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 253439,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 116159,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2181,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 4439,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 44511,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 54495,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 59647,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 110143,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 362751,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 150655,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 208639,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 55423,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 379,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2255,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 365,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 564,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1117,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 55455,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 579,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787548451409,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9943,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147327,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9703,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1622,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7795,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83007,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4079,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6711,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 138111,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1034751,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8703,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 41631,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9279,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4427,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7511,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 74367,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31455,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 23263,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 20543,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 968191,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4163,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 56991,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 3945,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 805,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3049,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 774,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1077,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1944,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2539,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1081,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787634539069,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 151423,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 351743,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 83327,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1101,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8215,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 67839,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3413,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 5923,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132351,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 677375,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 154495,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 354815,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 155775,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2707,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5095,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 73727,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 62943,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 44031,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 163583,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 399359,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 37855,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 393215,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 117503,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 475,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2711,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 458,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 732,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1447,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 76991,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 731,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787721050580,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9767,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 147711,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11039,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1568,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7759,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 85055,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4387,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6911,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 183167,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1025535,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8895,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 38815,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 10639,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4435,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7123,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 78911,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 25375,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 21103,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18031,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1466367,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 3769,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 31903,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 4043,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 805,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3089,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 777,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1071,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1982,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2823,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1097,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787844173644,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8147,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 114815,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 6975,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1329,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7923,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 80127,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 5043,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7087,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 137215,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1126399,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 6099,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35135,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6851,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3927,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6611,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 59295,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29983,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 19983,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18991,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1017855,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 1743,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 23311,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1844,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 586,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2845,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 576,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 969,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1856,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1973,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 997,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1787934787354,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9759,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 148735,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 10079,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1576,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7995,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 82687,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4247,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6323,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180735,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1004543,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8887,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37983,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9183,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4387,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7311,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70527,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 31375,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 24495,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 19263,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1021439,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4763,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26559,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 4371,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 768,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 3079,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 749,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1031,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1952,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3661,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1030,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788002205409,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10639,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 151295,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11519,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1523,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7699,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 86079,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4171,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6847,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 994815,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7691,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 40319,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8647,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4311,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7251,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 71487,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29519,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 28031,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21439,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 913407,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2869,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 27007,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2351,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 798,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2903,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 773,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1074,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1979,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2397,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1096,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788085434409,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8991,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 142079,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8679,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1536,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7627,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 85247,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4327,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6783,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180351,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1044479,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 7167,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37279,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8167,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4363,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7351,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 70399,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 30255,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 24735,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18911,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 978943,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2473,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 20799,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2343,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 763,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2799,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 754,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1087,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1951,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2367,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1084,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788173833602,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 15887,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 228479,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 101631,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1324,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7743,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 78015,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4483,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7483,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 180223,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1008127,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 150143,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 186495,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 122431,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3903,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6647,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65215,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 52255,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 47647,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 138751,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 619007,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 7723,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 238847,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 9639,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 462,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2509,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 446,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 906,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1715,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 5695,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 969,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788256142136,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 10423,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 137727,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 11399,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1558,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7875,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 84479,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4347,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6519,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 132607,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1040895,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 9031,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 40063,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 9607,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4455,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7467,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 75135,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 47295,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 38879,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 25663,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1025023,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4759,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26751,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 4475,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 794,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2995,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 749,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 929,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1693,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 3831,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 959,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788339821903,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 9679,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 141567,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 8139,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1519,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7499,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83647,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4579,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6987,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 133503,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1038847,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 8263,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 37119,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 8847,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 4367,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 7207,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 86463,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 28543,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 25615,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 21263,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1059839,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 4583,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 33407,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 5519,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 787,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2961,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 776,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 1051,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1876,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2563,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1078,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788426776164,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8799,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 105983,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 9439,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1172,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8159,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 83199,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3547,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 7003,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 129983,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1363967,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5819,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 35487,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 5383,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2869,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5971,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 84287,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 34303,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 22495,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18895,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 1234943,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2259,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 17999,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 1885,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 570,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2671,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 543,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 739,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1428,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 1848,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 759,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788513029646,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 8695,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 118655,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 7895,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1448,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 7875,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 79103,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 4547,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 6983,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 134271,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 1068031,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 5823,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 36543,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 6871,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 3983,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 6447,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 59167,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 29407,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 20527,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 18655,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 995839,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 2038,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 26063,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 2027,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 615,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2875,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 597,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 991,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1763,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 2025,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 1020,
            "unit": "us"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "h4vismat",
            "username": "h4vismat",
            "email": "h4vismat@pm.me"
          },
          "committer": {
            "name": "GitHub",
            "username": "web-flow",
            "email": "noreply@github.com"
          },
          "id": "28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99",
          "message": "Merge worktree-talea-core-bump: bump talea-core to 0.1.1 to publish talea-service\n\nrelease: bump talea-core to 0.1.1 to publish talea-service",
          "timestamp": "2026-06-27T04:19:43Z",
          "url": "https://github.com/mooze-labs/talea/commit/28b0ce4446d474ab7c25ce7a6ff4e75f8362ec99"
        },
        "date": 1788598152689,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "post-one-book/sqlite/p99-post@c8",
            "value": 48415,
            "unit": "us"
          },
          {
            "name": "post-one-book/sqlite/batch-25/p99-post@c8",
            "value": 248063,
            "unit": "us"
          },
          {
            "name": "post-many-books/sqlite/p99-post@c8",
            "value": 86015,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-balance@c8",
            "value": 1077,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-history@c8",
            "value": 8095,
            "unit": "us"
          },
          {
            "name": "reads/sqlite/p99-trial-balance@c8",
            "value": 64607,
            "unit": "us"
          },
          {
            "name": "overload/sqlite/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/sqlite/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/sqlite/p99-balance@c8",
            "value": 3299,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-history@c8",
            "value": 5935,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-post@c8",
            "value": 122175,
            "unit": "us"
          },
          {
            "name": "mixed/sqlite/p99-trial-balance@c8",
            "value": 735231,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/p99-post@c8",
            "value": 44223,
            "unit": "us"
          },
          {
            "name": "post-one-book/postgres/batch-25/p99-post@c8",
            "value": 133119,
            "unit": "us"
          },
          {
            "name": "post-many-books/postgres/p99-post@c8",
            "value": 74943,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-balance@c8",
            "value": 2575,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-history@c8",
            "value": 5727,
            "unit": "us"
          },
          {
            "name": "reads/postgres/p99-trial-balance@c8",
            "value": 65791,
            "unit": "us"
          },
          {
            "name": "overload/postgres/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/postgres/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/postgres/p99-balance@c8",
            "value": 66623,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-history@c8",
            "value": 57375,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-post@c8",
            "value": 112703,
            "unit": "us"
          },
          {
            "name": "mixed/postgres/p99-trial-balance@c8",
            "value": 681471,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/p99-post@c8",
            "value": 16991,
            "unit": "us"
          },
          {
            "name": "post-one-book/log/batch-25/p99-post@c8",
            "value": 165887,
            "unit": "us"
          },
          {
            "name": "post-many-books/log/p99-post@c8",
            "value": 10727,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-balance@c8",
            "value": 456,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-history@c8",
            "value": 2553,
            "unit": "us"
          },
          {
            "name": "reads/log/p99-trial-balance@c8",
            "value": 443,
            "unit": "us"
          },
          {
            "name": "overload/log/error-rate/raw-503",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "overload/log/error-rate/retry-to-success",
            "value": 0,
            "unit": "errors/op"
          },
          {
            "name": "mixed/log/p99-balance@c8",
            "value": 764,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-history@c8",
            "value": 1558,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-post@c8",
            "value": 15095,
            "unit": "us"
          },
          {
            "name": "mixed/log/p99-trial-balance@c8",
            "value": 811,
            "unit": "us"
          }
        ]
      }
    ]
  }
}