//! Static bearer-token middleware with scoped tokens. Token unset => open mode (dev).

use std::collections::HashSet;
use std::sync::Arc;

use axum::extract::{Request, State};
use axum::middleware::Next;
use axum::response::Response;
use serde::Deserialize;
use subtle::ConstantTimeEq;
use talea_core::api::ApiError;

use crate::http::error::ApiFailure;

/// Which books a token reaches.
#[derive(Clone, Debug, PartialEq)]
pub enum BookSet {
    All,
    Named(HashSet<String>),
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Access {
    ReadOnly,
    ReadWrite,
}

/// A token's authorization, resolved by `require_bearer` and injected as a
/// request extension. `name` is the config entry name — safe for logs and
/// errors; the secret never leaves `AuthConfig`.
#[derive(Clone, Debug)]
pub struct TokenScope {
    pub name: String,
    pub books: BookSet,
    pub access: Access,
}

impl TokenScope {
    pub fn allows_read(&self, book: &str) -> bool {
        match &self.books {
            BookSet::All => true,
            BookSet::Named(set) => set.contains(book),
        }
    }

    pub fn allows_write(&self, book: &str) -> bool {
        self.access == Access::ReadWrite && self.allows_read(book)
    }

    /// The asset registry is global (system book): only all-books rw tokens.
    pub fn allows_registry(&self) -> bool {
        self.access == Access::ReadWrite && matches!(self.books, BookSet::All)
    }

    fn all_access(name: &str) -> Arc<Self> {
        Arc::new(Self {
            name: name.to_string(),
            books: BookSet::All,
            access: Access::ReadWrite,
        })
    }
}

#[derive(Clone, Default)]
pub struct AuthConfig {
    /// (secret, scope) pairs; empty = open mode (dev).
    pub entries: Vec<(String, Arc<TokenScope>)>,
}

impl AuthConfig {
    /// No tokens at all: open dev mode.
    pub fn open() -> Self {
        Self::default()
    }

    /// The legacy single-token semantic: None = open, Some = one unnamed
    /// all-books rw entry (TALEA_API_TOKEN equivalence).
    pub fn single(token: Option<String>) -> Self {
        Self {
            entries: token
                .map(|t| vec![(t, TokenScope::all_access("legacy"))])
                .unwrap_or_default(),
        }
    }
}

pub async fn require_bearer(
    State(auth): State<AuthConfig>,
    mut req: Request,
    next: Next,
) -> Result<Response, ApiFailure> {
    if auth.entries.is_empty() {
        // open mode: everything allowed, as before
        req.extensions_mut().insert(TokenScope::all_access("open"));
        return Ok(next.run(req).await);
    }
    let provided = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(parse_bearer);
    let Some(token) = provided else {
        return Err(ApiFailure(ApiError::Unauthorized));
    };
    // Each comparison is constant-time (ct_eq; length short-circuit is fine —
    // lengths aren't secret). Stopping at the first match is fine: callers
    // know their own token. N is operator-scale small.
    for (secret, scope) in &auth.entries {
        if bool::from(token.as_bytes().ct_eq(secret.as_bytes())) {
            req.extensions_mut().insert(Arc::clone(scope));
            return Ok(next.run(req).await);
        }
    }
    Err(ApiFailure(ApiError::Unauthorized))
}

// --- tokens file -------------------------------------------------------

#[derive(Deserialize)]
struct TokensFile {
    #[serde(default)]
    tokens: std::collections::BTreeMap<String, TokenEntry>,
}

#[derive(Deserialize)]
struct TokenEntry {
    token: String,
    books: Vec<String>,
    access: String,
}

/// Parse a TALEA_TOKENS_FILE document. Errors name the entry, never the
/// secret. Pure (string in) so it is unit-testable; the caller reads the file.
pub fn parse_tokens(text: &str) -> Result<Vec<(String, Arc<TokenScope>)>, String> {
    let file: TokensFile = toml::from_str(text).map_err(|e| {
        // e's Display would echo the offending source line (which may hold a
        // secret); message() is the diagnostic text only.
        format!("tokens file is not valid TOML: {}", e.message())
    })?;
    let mut entries = Vec::new();
    for (name, entry) in file.tokens {
        if entry.token.is_empty() {
            return Err(format!("token entry '{name}': token must not be empty"));
        }
        let books = match entry.books.as_slice() {
            [] => return Err(format!("token entry '{name}': books must not be empty")),
            [s] if s == "*" => BookSet::All,
            list if list.iter().any(|b| b == "*") => {
                return Err(format!(
                    "token entry '{name}': '*' cannot be mixed with named books"
                ));
            }
            list => BookSet::Named(list.iter().cloned().collect()),
        };
        let access = match entry.access.as_str() {
            "ro" => Access::ReadOnly,
            "rw" => Access::ReadWrite,
            other => {
                return Err(format!(
                    "token entry '{name}': access must be \"ro\" or \"rw\", got \"{other}\""
                ));
            }
        };
        entries.push((
            entry.token,
            Arc::new(TokenScope {
                name,
                books,
                access,
            }),
        ));
    }
    for (i, (secret, scope)) in entries.iter().enumerate() {
        if entries[..i].iter().any(|(s, _)| s == secret) {
            return Err(format!(
                "token entry '{}': duplicate token value (secrets must be unique)",
                scope.name
            ));
        }
    }
    Ok(entries)
}

/// RFC 7235 credentials: a case-insensitive auth-scheme, one-or-more spaces,
/// then the token.
fn parse_bearer(header: &str) -> Option<&str> {
    let (scheme, rest) = header.split_once(' ')?;
    if !scheme.eq_ignore_ascii_case("Bearer") {
        return None;
    }
    let token = rest.trim_start_matches(' ');
    (!token.is_empty()).then_some(token)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_bearer_scheme_case_insensitive() {
        assert_eq!(parse_bearer("Bearer tok"), Some("tok"));
        assert_eq!(parse_bearer("bearer tok"), Some("tok"));
        assert_eq!(parse_bearer("BEARER tok"), Some("tok"));
    }

    #[test]
    fn parse_bearer_allows_multiple_spaces() {
        assert_eq!(parse_bearer("Bearer  tok"), Some("tok"));
    }

    #[test]
    fn parse_bearer_rejects_other_shapes() {
        assert_eq!(parse_bearer("Basic tok"), None);
        assert_eq!(parse_bearer("Bearer"), None);
        assert_eq!(parse_bearer("Bearer "), None);
        assert_eq!(parse_bearer("Bearertok"), None);
        assert_eq!(parse_bearer(""), None);
    }

    fn scope(books: BookSet, access: Access) -> TokenScope {
        TokenScope {
            name: "t".into(),
            books,
            access,
        }
    }

    #[test]
    fn scope_truth_table() {
        let named: HashSet<String> = ["a".to_string()].into();
        let ro_a = scope(BookSet::Named(named.clone()), Access::ReadOnly);
        assert!(ro_a.allows_read("a"));
        assert!(!ro_a.allows_read("b"));
        assert!(!ro_a.allows_write("a"));
        assert!(!ro_a.allows_registry());

        let rw_a = scope(BookSet::Named(named), Access::ReadWrite);
        assert!(rw_a.allows_write("a"));
        assert!(!rw_a.allows_write("b"));
        assert!(!rw_a.allows_registry());

        let ro_all = scope(BookSet::All, Access::ReadOnly);
        assert!(ro_all.allows_read("anything"));
        assert!(!ro_all.allows_write("anything"));
        assert!(!ro_all.allows_registry());

        let rw_all = scope(BookSet::All, Access::ReadWrite);
        assert!(rw_all.allows_write("anything"));
        assert!(rw_all.allows_registry());
    }

    #[test]
    fn parse_tokens_happy_path() {
        let entries = parse_tokens(
            r#"
            [tokens.payments]
            token = "s1"
            books = ["payments"]
            access = "rw"

            [tokens.reporting]
            token = "s2"
            books = ["*"]
            access = "ro"
            "#,
        )
        .unwrap();
        assert_eq!(entries.len(), 2);
        let payments = &entries.iter().find(|(s, _)| s == "s1").unwrap().1;
        assert_eq!(payments.name, "payments");
        assert!(payments.allows_write("payments"));
        assert!(!payments.allows_registry());
        let reporting = &entries.iter().find(|(s, _)| s == "s2").unwrap().1;
        assert!(reporting.allows_read("anything"));
        assert!(!reporting.allows_write("anything"));
    }

    #[test]
    fn parse_tokens_rejects_bad_configs() {
        // each error names the entry and never echoes a secret
        let cases = [
            (
                "[tokens.a]\ntoken = \"s\"\nbooks = []\naccess = \"rw\"",
                "books must not be empty",
            ),
            (
                "[tokens.a]\ntoken = \"s\"\nbooks = [\"*\", \"b\"]\naccess = \"rw\"",
                "cannot be mixed",
            ),
            (
                "[tokens.a]\ntoken = \"s\"\nbooks = [\"b\"]\naccess = \"rwx\"",
                "must be \"ro\" or \"rw\"",
            ),
            (
                "[tokens.a]\ntoken = \"\"\nbooks = [\"b\"]\naccess = \"rw\"",
                "must not be empty",
            ),
            (
                "[tokens.a]\ntoken = \"dup\"\nbooks = [\"a\"]\naccess = \"rw\"\n[tokens.b]\ntoken = \"dup\"\nbooks = [\"b\"]\naccess = \"rw\"",
                "duplicate token",
            ),
            ("not toml [", "not valid TOML"),
        ];
        for (text, expect) in cases {
            let err = parse_tokens(text).unwrap_err();
            assert!(err.contains(expect), "for {text:?}: got {err:?}");
            assert!(
                !err.contains("\"s\""),
                "error must not echo the secret: {err:?}"
            );
        }
    }

    #[test]
    fn toml_errors_never_echo_source_lines() {
        // broken syntax ON the secret-bearing line
        let err = parse_tokens(
            "[tokens.a]\ntoken = \"SUPERSECRET\" garbage\nbooks = [\"b\"]\naccess = \"rw\"",
        )
        .unwrap_err();
        assert!(err.contains("not valid TOML"), "got: {err:?}");
        assert!(
            !err.contains("SUPERSECRET"),
            "secret echoed in error: {err:?}"
        );
    }

    #[test]
    fn single_maps_legacy_semantics() {
        assert!(AuthConfig::single(None).entries.is_empty());
        let cfg = AuthConfig::single(Some("tok".into()));
        assert_eq!(cfg.entries.len(), 1);
        assert!(cfg.entries[0].1.allows_registry());
    }
}
