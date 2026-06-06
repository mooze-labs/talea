window.BENCHMARK_DATA = {
  "lastUpdate": 1780759602080,
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
      }
    ]
  }
}