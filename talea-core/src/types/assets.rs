//! Asset registry.

#[derive(Debug, Clone)]
pub struct AssetDef {
    pub id: AssetId,
    pub class: AssetClass,
    pub precision: u8, // decimal places - IMMUTABLE once registered
    pub name: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct AssetId(String); // "USD", "BTC", "L-USDT", "USDT-ETH";

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Network(String); // "bitcoin", "liquid", "ethereum"...

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AssetClass {
    Fiat,
    Crypto {
        network: Network,
        native_id: Option<String>,
    }, // asset_id, contract addr
}

#[derive(Debug, Clone)]
pub struct Amount {
    minor: i64,
    asset: AssetId,
}
