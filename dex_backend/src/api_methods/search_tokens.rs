use crate::TOKEN_METADATA_CACHE;
use dashmap::DashMap;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use warp::{http::StatusCode, reply, Rejection, Reply};

#[derive(Serialize, Deserialize, Clone)]
pub struct TokenSearchResult {
    pub name: String,
    pub symbol: String,
    pub address: String,
    pub logoURI: String,
}

#[derive(Deserialize)]
struct TokenQuery {
    query: Option<String>,
}

pub async fn search_tokens_handler(
    query: HashMap<String, String>,
) -> Result<impl Reply, Rejection> {
    let search_term = query
        .get("query")
        .cloned()
        .unwrap_or_default()
        .to_lowercase()
        .trim()
        .to_string();

    if search_term.is_empty() {
        return Ok(warp::reply::json(&serde_json::json!({
            "success": true,
            "results": []
        })));
    }

    // Read token list
    let tokens: Vec<TokenSearchResult> = include_str!("../../tokens.json")
        .parse::<serde_json::Value>()
        .unwrap()["tokens"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|t| {
            Some(TokenSearchResult {
                name: t["name"].as_str()?.to_string(),
                symbol: t["symbol"].as_str()?.to_string(),
                address: t["address"].as_str()?.to_string(),
                logoURI: t["logoURI"].as_str()?.to_string(),
            })
        })
        .collect();

    // Score & sort
    let mut scored: Vec<(u32, TokenSearchResult)> = tokens
        .into_iter()
        .filter_map(|token| {
            let symbol = token.symbol.to_lowercase();
            let name = token.name.to_lowercase();

            let score = if symbol == search_term {
                100
            } else if symbol.starts_with(&search_term) {
                90
            } else if name.starts_with(&search_term) {
                80
            } else if symbol.contains(&search_term) {
                70
            } else if name.contains(&search_term) {
                60
            } else {
                0
            };

            if score > 0 {
                Some((score, token))
            } else {
                None
            }
        })
        .collect();

    scored.sort_by(|a, b| b.0.cmp(&a.0)); // sort descending

    let sorted_tokens: Vec<TokenSearchResult> = scored
        .into_iter()
        .map(|(_, token)| token)
        .take(50)
        .collect();

    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "results": sorted_tokens
    })))
}

pub async fn search_token_by_mint_handler(
    query: HashMap<String, String>,
) -> Result<impl Reply, Rejection> {
    let mint = query
        .get("query")
        .cloned()
        .unwrap_or_default()
        .trim()
        .to_string();

    if mint.is_empty() {
        return Ok(warp::reply::json(&serde_json::json!({
            "success": false,
            "error": "Missing 'mint' parameter"
        })));
    }

    let cache = TOKEN_METADATA_CACHE.get_or_init(DashMap::new);

    if let Some(entry) = cache.get(&mint) {
        println!(
            "[search_tokens] Found token metadata in cache for mint: {}",
            mint
        );
        return Ok(warp::reply::json(&serde_json::json!({
            "success": true,
            "result": entry.clone()
        })));
    }

    if let Some(token) = fetch_token_from_moralis(&mint).await {
        println!(
            "[search_tokens] Found token metadata from Moralis for mint: {}",
            mint
        );
        cache.insert(mint.clone(), token.clone());
        return Ok(warp::reply::json(&serde_json::json!({
            "success": true,
            "result": token
        })));
    }

    Ok(warp::reply::json(&serde_json::json!({
        "success": false,
        "error": "Token not found"
    })))
}

async fn fetch_token_from_moralis(mint: &str) -> Option<TokenSearchResult> {
    let moralis_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImI0ZjkyYmEzLWJkZDgtNDZjYi04MzQyLWRkYTA3YWNiYmNiNiIsIm9yZ0lkIjoiNDQxOTE2IiwidXNlcklkIjoiNDU0NjYyIiwidHlwZUlkIjoiYzA5YWU5MDYtOGMwYy00YWZhLWE5NDEtMzdmMmYxOTEyZDYzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDQ3Mjk3NDcsImV4cCI6NDkwMDQ4OTc0N30.odQxhX-qvBTeFZmKJONFmx8El9x4qwtMbtd38k_KKsU";
    let client = Client::new();
    let url = format!(
        "https://solana-gateway.moralis.io/token/mainnet/{}/metadata",
        mint
    );

    match client
        .get(&url)
        .header("accept", "application/json")
        .header("X-API-Key", moralis_api_key)
        .send()
        .await
    {
        Ok(resp) if resp.status().is_success() => {
            if let Ok(json) = resp.json::<Value>().await {
                Some(TokenSearchResult {
                    name: json["name"].as_str().unwrap_or("Unknown Token").to_string(),
                    symbol: json["symbol"].as_str().unwrap_or("UNKNOWN").to_string(),
                    address: mint.to_string(),
                    logoURI: json["logo"].as_str().unwrap_or("").to_string(),
                })
            } else {
                None
            }
        }
        _ => None,
    }
}

pub async fn get_capped_tokens_handler(
    query: HashMap<String, String>,
) -> Result<Box<dyn Reply>, Rejection> {
    let query_param = query
        .get("query")
        .cloned()
        .unwrap_or_default()
        .trim()
        .to_string();

    let url = if !query_param.is_empty() {
        format!(
            "https://wallet-api.solflare.com/v2/swap/capped-tokens?currency=USD&query={}",
            query_param
        )
    } else {
        "https://wallet-api.solflare.com/v2/swap/capped-tokens?currency=USD".to_string()
    };

    let client = Client::new();
    match client
        .get(&url)
        .header("accept", "*/*")
        .header("accept-encoding", "gzip, deflate, br, zstd")
        .header("accept-language", "en-US,en;q=0.9")
        .header("authorization", "Bearer b75ef849-9db2-4b6b-9d2d-82e0c392593e")
        .header("content-type", "application/json")
        .header("dnt", "1")
        .header("origin", "chrome-extension://bhhhlbepdkbapadjdnnojkbgioiodbic")
        .header("priority", "u=1, i")
        .header("sec-fetch-dest", "empty")
        .header("sec-fetch-mode", "cors")
        .header("sec-fetch-site", "none")
        .header("sec-fetch-storage-access", "active")
        .header("user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
    {
        Ok(resp) => match resp.json::<serde_json::Value>().await {
            Ok(json) => Ok(Box::new(reply::json(&json))),
            Err(_) => Ok(Box::new(reply::with_status(
                reply::json(&json!({ "error": "Failed to parse JSON from upstream" })),
                StatusCode::BAD_GATEWAY,
            ))),
        },
        Err(_) => Ok(Box::new(reply::with_status(
            reply::json(&json!({ "error": "Failed to fetch from upstream" })),
            StatusCode::BAD_GATEWAY,
        ))),
    }
}
