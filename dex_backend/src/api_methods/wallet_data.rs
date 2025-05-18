use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use warp::{Rejection, Reply};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub mint: String,
    #[serde(rename = "imageUri")]
    pub logoURI: String,
    pub accounts: Vec<TokenAccountInfo>,
    #[serde(rename = "totalUiAmount")]
    pub total_ui_amount: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TokenAccountInfo {
    pub pubkey: String,
    #[serde(rename = "uiAmount")]
    pub ui_amount: f64,
}

pub async fn get_wallet_data(address: &str) -> anyhow::Result<Value> {
    let url = format!(
        "https://wallet-api.solflare.com/v3/portfolio/tokens/{}?network=mainnet&currency=USD&enablePartialErrors=true",
        address
    );

    let client = Client::new();
    let res = client
        .get(&url)
        .header("accept", "*/*")
        .header("accept-encoding", "gzip, deflate, br, zstd")
        .header("accept-language", "ru,en-US;q=0.9,en;q=0.8,de;q=0.7")
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
        .send()
        .await?;

    let body: Value = res.json().await?;
    Ok(body)
}

pub async fn wallet_data_handler(query: HashMap<String, String>) -> Result<impl Reply, Rejection> {
    let address = query.get("address").cloned().unwrap_or_default();

    match get_wallet_data(&address).await {
        Ok(data) => Ok(warp::reply::json(&serde_json::json!({
            "success": true,
            "result": data
        }))),
        Err(e) => Ok(warp::reply::json(&serde_json::json!({
            "success": false,
            "error": e.to_string()
        }))),
    }
}
