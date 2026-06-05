-- trial_balance filters postings by book (optionally bounded by commit
-- time); without this index it scans the whole table.
CREATE INDEX postings_book_time ON postings (book, committed_at);
