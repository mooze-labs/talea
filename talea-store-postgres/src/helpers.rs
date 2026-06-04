use talea_core::types::*;

/// LISTEN/NOTIFY channel for a book.
///
/// Postgres truncates channel names to 63 bytes (NAMEDATALEN - 1), so two
/// distinct long book names could silently collide onto one channel. Long
/// names get a deterministic FNV-1a suffix instead: a readable prefix plus
/// a 16-hex-digit hash of the full name, always <= 63 bytes.
pub fn book_channel_name(book: &Book) -> String {
    let full = format!("talea_{}", book.0);
    if full.len() <= 63 {
        return full;
    }
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for byte in full.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x0100_0000_01b3);
    }
    // prefix (<= 46 bytes, on a char boundary) + '_' + 16 hex = <= 63 bytes
    let mut end = 46.min(full.len());
    while !full.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}_{hash:016x}", &full[..end])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn short_names_pass_through() {
        assert_eq!(book_channel_name(&Book("onramp".into())), "talea_onramp");
    }

    #[test]
    fn long_names_fit_postgres_limit_and_stay_distinct() {
        // identical in the first 46 bytes, divergent only past the
        // would-be truncation point
        let a = Book("x".repeat(80));
        let b = Book(format!("{}y", "x".repeat(79)));
        let ca = book_channel_name(&a);
        let cb = book_channel_name(&b);
        assert!(ca.len() <= 63);
        assert!(cb.len() <= 63);
        assert_ne!(ca, cb);
    }
}
