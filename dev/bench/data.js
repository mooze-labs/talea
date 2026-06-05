window.BENCHMARK_DATA = {
  "lastUpdate": 1780632122136,
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
      }
    ]
  }
}