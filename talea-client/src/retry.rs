//! Bounded retry with exponential backoff. All client operations are safe
//! to retry by construction: posts carry idempotency keys, registry writes
//! are idempotent on id, reads are reads.

use std::time::Duration;

#[derive(Debug, Clone)]
pub struct RetryPolicy {
    /// Total attempts including the first (1 = no retries).
    pub max_attempts: u32,
    pub base_delay: Duration,
    pub max_delay: Duration,
}

impl Default for RetryPolicy {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            base_delay: Duration::from_millis(200),
            max_delay: Duration::from_secs(5),
        }
    }
}

impl RetryPolicy {
    /// No retries: every failure surfaces immediately.
    pub fn none() -> Self {
        Self {
            max_attempts: 1,
            ..Self::default()
        }
    }

    /// Backoff before retry number `attempt` (0-based). A server-provided
    /// Retry-After overrides the exponential value; both are capped.
    pub fn delay_for(&self, attempt: u32, retry_after: Option<Duration>) -> Duration {
        if let Some(ra) = retry_after {
            return ra.min(self.max_delay);
        }
        self.base_delay
            .saturating_mul(2u32.saturating_pow(attempt))
            .min(self.max_delay)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backoff_doubles_and_caps() {
        let p = RetryPolicy::default();
        assert_eq!(p.delay_for(0, None), Duration::from_millis(200));
        assert_eq!(p.delay_for(1, None), Duration::from_millis(400));
        assert_eq!(p.delay_for(2, None), Duration::from_millis(800));
        assert_eq!(p.delay_for(30, None), Duration::from_secs(5)); // capped
    }

    #[test]
    fn retry_after_overrides_but_caps() {
        let p = RetryPolicy::default();
        assert_eq!(
            p.delay_for(0, Some(Duration::from_secs(1))),
            Duration::from_secs(1)
        );
        assert_eq!(
            p.delay_for(0, Some(Duration::from_secs(60))),
            Duration::from_secs(5)
        );
    }

    #[test]
    fn none_means_single_attempt() {
        assert_eq!(RetryPolicy::none().max_attempts, 1);
    }
}
