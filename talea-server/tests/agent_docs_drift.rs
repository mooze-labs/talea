//! Guards the agent-oriented docs against drift.
//!
//! `docs/AGENTS-INTEGRATION.md` carries an endpoint table marked with
//! `drift-guard:endpoints`; this test asserts it lists exactly the
//! (METHOD, path) pairs the compile-time OpenAPI document declares.
//! `tests/http.rs::openapi_spec_is_complete_and_open` already pins the
//! spec to the router, so table == spec implies table == router.

// Test code: a panicking expect IS the test failing (clippy.toml
// exempts #[test] fns; this extends that to integration-test helpers).
#![allow(clippy::expect_used)]

use std::collections::BTreeSet;
use std::path::PathBuf;

use utoipa::OpenApi;

fn docs_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../docs")
}

/// (METHOD, path) pairs declared by the OpenAPI document.
fn spec_routes() -> BTreeSet<(String, String)> {
    let spec = serde_json::to_value(talea_server::http::openapi::ApiDoc::openapi())
        .expect("openapi doc serializes");
    let mut out = BTreeSet::new();
    for (path, ops) in spec["paths"].as_object().expect("paths object") {
        for method in ops.as_object().expect("operations object").keys() {
            out.insert((method.to_uppercase(), path.clone()));
        }
    }
    out
}

/// A GFM table separator cell: dashes with optional alignment colons.
fn is_separator(cell: &str) -> bool {
    let dashes = cell.trim_start_matches(':').trim_end_matches(':');
    !dashes.is_empty() && dashes.chars().all(|c| c == '-')
}

/// (METHOD, path) pairs from the first markdown table after the
/// `drift-guard:endpoints` marker.
fn doc_routes(doc: &str) -> BTreeSet<(String, String)> {
    let after = doc
        .split("drift-guard:endpoints")
        .nth(1)
        .expect("docs/AGENTS-INTEGRATION.md: missing drift-guard:endpoints marker");
    let mut rows = BTreeSet::new();
    let mut in_table = false;
    for line in after.lines() {
        let line = line.trim();
        if !line.starts_with('|') {
            if in_table {
                break; // table ended
            }
            continue; // marker comment / blank lines before the table
        }
        in_table = true;
        let cells: Vec<&str> = line
            .trim_matches('|')
            .split('|')
            .map(|c| c.trim().trim_matches('`'))
            .collect();
        assert!(cells.len() >= 2, "endpoint table row with <2 cells: {line}");
        if cells[0] == "Method" || is_separator(cells[0]) {
            continue; // header or separator row
        }
        rows.insert((cells[0].to_string(), cells[1].to_string()));
    }
    assert!(
        !rows.is_empty(),
        "drift-guard endpoint table has no data rows"
    );
    rows
}

#[test]
fn agent_doc_endpoint_table_matches_openapi() {
    let doc = std::fs::read_to_string(docs_dir().join("AGENTS-INTEGRATION.md"))
        .expect("docs/AGENTS-INTEGRATION.md must exist");
    let spec = spec_routes();
    let table = doc_routes(&doc);
    let missing: Vec<_> = spec.difference(&table).collect();
    let extra: Vec<_> = table.difference(&spec).collect();
    assert!(
        missing.is_empty() && extra.is_empty(),
        "AGENTS-INTEGRATION.md endpoint table drifted from the OpenAPI document.\n\
         missing from doc: {missing:?}\nextra in doc: {extra:?}"
    );
}
