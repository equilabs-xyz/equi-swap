use crate::api_methods::search_tokens::TokenSearchResult;
use crate::TOKEN_METADATA_CACHE;
use dashmap::DashMap;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::OnceLock;
use tokio::time::{interval, Duration};
// Global cache

/// Loads token list from Jupiter once on app start
pub async fn spawn_token_cache_loader() {
    let cache = TOKEN_METADATA_CACHE.get_or_init(DashMap::new);
    let client = Client::new();

    println!("[cache] Fetching full token list from Jupiter...");

    match client.get("https://cache.jup.ag/tokens").send().await {
        Ok(resp) => match resp.json::<Value>().await {
            Ok(json) => {
                if let Some(tokens) = json.as_array() {
                    let count = tokens.len();
                    for token in tokens {
                        if let (Some(address), Some(symbol), Some(name)) = (
                            token.get("address").and_then(|v| v.as_str()),
                            token.get("symbol").and_then(|v| v.as_str()),
                            token.get("name").and_then(|v| v.as_str()),
                        ) {
                            let logoURI = token
                                .get("logoURI")
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .to_string();

                            cache.insert(
                                address.to_string(),
                                TokenSearchResult {
                                    name: name.to_string(),
                                    symbol: symbol.to_string(),
                                    address: address.to_string(),
                                    logoURI,
                                },
                            );
                        }
                    }

                    println!("[cache] Loaded {} tokens from Jupiter ✅", count);
                } else {
                    eprintln!("[cache] Unexpected token format from Jupiter");
                }
            }
            Err(e) => {
                eprintln!("[cache] Failed to parse JSON from Jupiter: {}", e);
            }
        },
        Err(e) => {
            eprintln!("[cache] Failed to fetch Jupiter token list: {}", e);
        }
    }
}

/// Periodic refresh of token list every 5 minutes
pub fn spawn_token_cache_updater() {
    tokio::spawn(async {
        let cache = TOKEN_METADATA_CACHE.get_or_init(DashMap::new);
        let client = Client::new();
        let mut ticker = interval(Duration::from_secs(300)); // 5 minutes

        loop {
            ticker.tick().await;
            println!("[cache] Refreshing Jupiter token list...");

            match client.get("https://cache.jup.ag/tokens").send().await {
                Ok(resp) => match resp.json::<Value>().await {
                    Ok(json) => {
                        if let Some(tokens) = json["tokens"].as_array() {
                            let count = tokens.len();
                            for token in tokens {
                                if let (Some(address), Some(symbol), Some(name)) = (
                                    token.get("address").and_then(|v| v.as_str()),
                                    token.get("symbol").and_then(|v| v.as_str()),
                                    token.get("name").and_then(|v| v.as_str()),
                                ) {
                                    let logoURI = token
                                        .get("logoURI")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("")
                                        .to_string();

                                    cache.insert(
                                        address.to_string(),
                                        TokenSearchResult {
                                            name: name.to_string(),
                                            symbol: symbol.to_string(),
                                            address: address.to_string(),
                                            logoURI,
                                        },
                                    );
                                }
                            }

                            println!("[cache] Refreshed {} tokens ✅", count);
                        }
                    }
                    Err(e) => {
                        eprintln!("[cache] Error parsing Jupiter refresh: {}", e);
                    }
                },
                Err(e) => {
                    eprintln!("[cache] Error refreshing Jupiter token list: {}", e);
                }
            }
        }
    });
}
