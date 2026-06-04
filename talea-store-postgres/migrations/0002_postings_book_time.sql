-- trial_balance filters postings by book (optionally bounded by commit
-- time); without this index it seq-scans the whole table.
-- Plain CREATE INDEX (not CONCURRENTLY): sqlx runs migrations inside a
-- transaction, where CONCURRENTLY is illegal. Fine at current scale; a
-- deployment with a huge postings table should build it manually first.
CREATE INDEX postings_book_time ON postings (book, committed_at);
