use talea_core::types::*;

pub fn book_channel_name(book: &Book) -> String {
    format!("talea_{}", book.0)
}
