CREATE TABLE assets (
    id          TEXT PRIMARY KEY,
    class       TEXT NOT NULL,              -- 'fiat' | 'crypto'
    network     TEXT,
    native_id   TEXT,
    precision   INTEGER NOT NULL,
    name        TEXT NOT NULL
);

CREATE TABLE accounts (
    key         TEXT PRIMARY KEY,           -- AccountId::to_key() => "book:path"
    book        TEXT NOT NULL,
    path        TEXT NOT NULL,
    asset       TEXT NOT NULL REFERENCES assets(id),
    kind        TEXT NOT NULL,
    normal_side TEXT,                       -- 'D' | 'C' | NULL (clearing)
    min_balance INTEGER
);

-- per-book gapless sequence counter; the upsert-increment serializes writers per book
CREATE TABLE books (
    book     TEXT PRIMARY KEY,
    next_seq INTEGER NOT NULL DEFAULT 0
);

-- the append-only source of truth
CREATE TABLE events (
    book    TEXT NOT NULL,
    seq     INTEGER NOT NULL,
    at      TEXT NOT NULL,                  -- RFC3339 UTC
    kind    TEXT NOT NULL,
    payload TEXT NOT NULL,                  -- LedgerEvent as tagged JSON
    PRIMARY KEY (book, seq)
);

CREATE TABLE transactions (
    tx_id           TEXT PRIMARY KEY,
    book            TEXT NOT NULL,
    seq             INTEGER NOT NULL,
    idempotency_key TEXT NOT NULL,
    occurred_at     TEXT NOT NULL,
    committed_at    TEXT NOT NULL,
    metadata        TEXT NOT NULL,
    external_refs   TEXT NOT NULL,
    UNIQUE (book, idempotency_key)
);

CREATE TABLE postings (
    tx_id        TEXT NOT NULL REFERENCES transactions(tx_id),
    idx          INTEGER NOT NULL,
    account_key  TEXT NOT NULL REFERENCES accounts(key),
    asset        TEXT NOT NULL,
    minor        INTEGER NOT NULL,
    direction    TEXT NOT NULL,             -- 'D' | 'C'
    book         TEXT NOT NULL,
    seq          INTEGER NOT NULL,
    committed_at TEXT NOT NULL,
    PRIMARY KEY (tx_id, idx)
);
CREATE INDEX postings_account_time ON postings (account_key, committed_at);
CREATE INDEX postings_account_seq  ON postings (account_key, seq);

-- raw balance projection: balance = sum(debits) - sum(credits)
CREATE TABLE balances (
    account_key TEXT PRIMARY KEY REFERENCES accounts(key),
    asset       TEXT NOT NULL,
    balance     INTEGER NOT NULL,
    updated_seq INTEGER NOT NULL
);
