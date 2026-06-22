window.BENCHMARK_DATA = {
  "lastUpdate": 1782124180418,
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
      }
    ]
  }
}