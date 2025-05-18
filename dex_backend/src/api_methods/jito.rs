use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use chrono::{DateTime, Utc};
use solana_client::client_error::reqwest::StatusCode;
use warp::{Rejection, Reply};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JitoBundleTipFloor {
    /// Timestamp when the tip floor data was recorded
    pub time: DateTime<Utc>,

    /// 25th percentile of landed tips (in SOL)
    pub landed_tips_25th_percentile: f64,

    /// 50th percentile (median) of landed tips (in SOL)
    pub landed_tips_50th_percentile: f64,

    /// 75th percentile of landed tips (in SOL)
    pub landed_tips_75th_percentile: f64,

    /// 95th percentile of landed tips (in SOL)
    pub landed_tips_95th_percentile: f64,

    /// 99th percentile of landed tips (in SOL)
    pub landed_tips_99th_percentile: f64,

    /// Exponential Moving Average of the 50th percentile of landed tips (in SOL)
    pub ema_landed_tips_50th_percentile: f64,
}

/// Request type for the API endpoint
#[derive(Debug, Deserialize)]
pub struct JitoApiRequest {
    /// Optional parameter to filter or customize the request
    format: Option<String>,
}

/// Response type for the API endpoint
#[derive(Debug, Serialize)]
pub struct JitoApiResponse {
    /// Status of the response
    status: String,

    /// The tip floor data
    data: Vec<JitoBundleTipFloor>,

    /// Timestamp of when the response was generated
    timestamp: DateTime<Utc>,
}


async fn fetch_jito_tip_floor(client: &Client) -> Result<Vec<JitoBundleTipFloor>, reqwest::Error> {
    let response = client
        .get("https://bundles.jito.wtf/api/v1/bundles/tip_floor")
        .send()
        .await?;

    let tip_floors: Vec<JitoBundleTipFloor> = response.json().await?;
    Ok(tip_floors)
}

// Handler function for the Warp route
pub async fn handle_jito_tip_floor() -> Result<impl Reply, Rejection> {
    let client = Client::new();

    match fetch_jito_tip_floor(&client).await {
        Ok(tip_floors) => Ok(warp::reply::json(&serde_json::json!({
            "success": true,
            "result": {
                "data": tip_floors,
                "timestamp": Utc::now()
            }
        }))),
        Err(e) => {
            eprintln!("Error fetching Jito tip floor: {}", e);
            Ok(warp::reply::json(&serde_json::json!({
                "success": false,
                "error": e.to_string()
            })))
        }
    }
}


