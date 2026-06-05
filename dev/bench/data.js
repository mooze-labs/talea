window.BENCHMARK_DATA = {
  "lastUpdate": 1780639746625,
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
      }
    ]
  }
}