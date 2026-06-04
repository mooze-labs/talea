//! Asset registry.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssetDef {
    pub id: AssetId,
    pub class: AssetClass,
    pub precision: u8, // decimal places - IMMUTABLE once registered
    pub name: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AssetId(String); // "USD", "BTC", "L-USDT", "USDT-ETH";

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Network(String); // "bitcoin", "liquid", "ethereum"...

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AssetClass {
    Fiat,
    Crypto {
        network: Network,
        native_id: Option<String>,
    }, // asset_id, contract addr
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Amount {
    minor: i64,
    asset: AssetId,
}

impl AssetId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Network {
    pub fn new(network: impl Into<String>) -> Self {
        Self(network.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Amount {
    pub fn new(minor: i64, asset: AssetId) -> Self {
        Self { minor, asset }
    }

    pub fn minor(&self) -> i64 {
        self.minor
    }

    pub fn asset(&self) -> &AssetId {
        &self.asset
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn amount_accessors_round_trip() {
        let a = Amount::new(1500, AssetId::new("USD"));
        assert_eq!(a.minor(), 1500);
        assert_eq!(a.asset().as_str(), "USD");
        assert_eq!(Network::new("bitcoin").as_str(), "bitcoin");
    }
}
