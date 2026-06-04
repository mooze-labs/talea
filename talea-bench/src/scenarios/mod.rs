pub mod mixed;
pub mod overload;
pub mod post_many_books;
pub mod post_one_book;
pub mod reads;

/// Sweep lists drive idempotency-key scopes (`c{n}` / `b{n}`): zeros
/// divide-by-zero or spawn no workers, and duplicates reuse a scope —
/// cross-step dedup would undercount commits and fail verification.
pub(crate) fn validate_sweep(values: &[usize], flag: &str) -> Result<(), String> {
    if values.is_empty() {
        return Err(format!("--{flag} must not be empty"));
    }
    if values.contains(&0) {
        return Err(format!("--{flag} values must be > 0"));
    }
    let mut seen = std::collections::HashSet::new();
    for v in values {
        if !seen.insert(v) {
            return Err(format!(
                "--{flag} contains duplicate value {v}: steps would share an \
                 idempotency scope and dedup across steps, corrupting verification"
            ));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::validate_sweep;

    #[test]
    fn validate_sweep_rejects_empty_zero_and_duplicates() {
        assert!(validate_sweep(&[], "x").is_err());
        assert!(validate_sweep(&[1, 0], "x").is_err());
        assert!(
            validate_sweep(&[4, 8, 4], "x")
                .unwrap_err()
                .contains("duplicate")
        );
        assert!(validate_sweep(&[1, 2, 4], "x").is_ok());
    }
}
