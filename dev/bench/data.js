window.BENCHMARK_DATA = {
  "lastUpdate": 1780636765098,
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
      }
    ]
  }
}