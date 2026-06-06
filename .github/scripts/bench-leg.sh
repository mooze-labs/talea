#!/usr/bin/env bash
# One backend leg of the CI bench: init talead against $2, serve, run the
# $PROFILE scenario set, write reports to ./reports. Usage:
#   PROFILE=trimmed .github/scripts/bench-leg.sh sqlite "sqlite://bench.db"
set -euo pipefail
[[ $# -ge 2 ]] || { echo "usage: $0 <leg-name> <db-url>" >&2; exit 1; }

LEG="$1"      # leg name: per-leg working dir + log labels only
DB_URL="$2"
PROFILE="${PROFILE:-trimmed}"
ROOT="$(pwd)"
BIN="$ROOT/target/release"
[[ -x "$BIN/talead" && -x "$BIN/talea-bench" ]] || {
  echo "release binaries missing under $BIN — run from the repo root after a release build" >&2
  exit 1
}
REPORTS="$ROOT/reports"
mkdir -p "$REPORTS"

WORK="$ROOT/ci-bench/$LEG"
mkdir -p "$WORK"
cd "$WORK"

"$BIN/talead" init --db-url "$DB_URL"
"$BIN/talead" serve &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  curl -fsS -o /dev/null http://127.0.0.1:8080/health 2>/dev/null && break
  sleep 1
done
# Final check fails the leg loudly if the server never came up.
curl -fsS -o /dev/null http://127.0.0.1:8080/health

TALEA_TOKEN="$(grep '^TALEA_API_TOKEN=' .env | cut -d= -f2-)"
export TALEA_TOKEN

bench() { "$BIN/talea-bench" --out-dir "$REPORTS" "$@"; }

echo "=== bench leg: $LEG ($PROFILE) ==="
if [ "$PROFILE" = "full" ]; then
  bench post-one-book
  # Batch path: 8×25 = 200 in-flight drafts fits the default
  # TALEA_WRITE_QUEUE_DEPTH=256 with margin; c8 is the summarize rep step.
  bench post-one-book --concurrency 8 --batch-size 25
  bench post-many-books
  # Default reads sweep (1,4,16,64) lacks the c8 representative step.
  bench reads --concurrency 1,4,8,16,64
  bench overload
  bench mixed
else
  bench --warmup-secs 2 --duration-secs 10 post-one-book --concurrency 1,4,8
  # Batch path (see full profile note): 8×25 fits the default queue depth.
  bench --warmup-secs 2 --duration-secs 10 post-one-book --concurrency 8 --batch-size 25
  bench --warmup-secs 2 --duration-secs 10 reads --concurrency 1,4,8 --depth 2000
fi
