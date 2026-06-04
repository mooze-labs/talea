CREATE TABLE assets (
    id          TEXT PRIMARY KEY,
    class       TEXT NOT NULL,              -- 'fiat' | 'crypto'
    network     TEXT,
    native_id   TEXT,
    precision   SMALLINT NOT NULL,
    name        TEXT NOT NULL
);

CREATE TABLE accounts (
    key         TEXT PRIMARY KEY,           -- AccountId::to_key() => "book:path"
    book        TEXT NOT NULL,
    path        TEXT NOT NULL,
    asset       TEXT NOT NULL REFERENCES assets(id),
    kind        TEXT NOT NULL,
    normal_side TEXT,                       -- 'D' | 'C' | NULL (clearing)
    min_balance BIGINT
);

-- per-book gapless sequence counter; the upsert-increment row-locks the
-- counter until transaction end, serializing concurrent writers per book
CREATE TABLE books (
    book     TEXT PRIMARY KEY,
    next_seq BIGINT NOT NULL DEFAULT 0
);

-- the append-only source of truth
CREATE TABLE events (
    book    TEXT NOT NULL,
    seq     BIGINT NOT NULL,
    at      TIMESTAMPTZ NOT NULL,
    kind    TEXT NOT NULL,
    payload JSONB NOT NULL,                 -- LedgerEvent as tagged JSON
    PRIMARY KEY (book, seq)
);

CREATE TABLE transactions (
    tx_id           UUID PRIMARY KEY,
    book            TEXT NOT NULL,
    seq             BIGINT NOT NULL,
    idempotency_key TEXT NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL,
    committed_at    TIMESTAMPTZ NOT NULL,
    metadata        JSONB NOT NULL,
    external_refs   JSONB NOT NULL,
    UNIQUE (book, idempotency_key)
);

CREATE TABLE postings (
    tx_id        UUID NOT NULL REFERENCES transactions(tx_id),
    idx          INTEGER NOT NULL,
    account_key  TEXT NOT NULL REFERENCES accounts(key),
    asset        TEXT NOT NULL,
    minor        BIGINT NOT NULL,
    direction    TEXT NOT NULL,             -- 'D' | 'C'
    book         TEXT NOT NULL,
    seq          BIGINT NOT NULL,
    committed_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (tx_id, idx)
);
CREATE INDEX postings_account_time ON postings (account_key, committed_at);
CREATE INDEX postings_account_seq  ON postings (account_key, seq);

-- raw balance projection: balance = sum(debits) - sum(credits)
CREATE TABLE balances (
    account_key TEXT PRIMARY KEY REFERENCES accounts(key),
    asset       TEXT NOT NULL,
    balance     BIGINT NOT NULL,
    updated_seq BIGINT NOT NULL
);
