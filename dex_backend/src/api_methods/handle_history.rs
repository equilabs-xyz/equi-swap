use anyhow::Result;
use serde::{Deserialize, Serialize};
use solana_sdk::pubkey::Pubkey;
use crate::{REQWEST_CLIENT, SEEN_SIGNATURES};
use std::collections::{HashMap, HashSet};
use std::str::FromStr;
use std::time::Duration;
use dotenv::dotenv;
use serde_json::{json, Value};
use warp::http::StatusCode;
use warp::Reply;
use crate::api_methods::get_random_helius_rpc::get_random_helius_rpc;
use futures::stream::{iter, FuturesUnordered, StreamExt};
use mpl_token_metadata::ID as TOKEN_METADATA_PROGRAM_ID;
use mpl_token_metadata::accounts::Metadata;
use reqwest::Client;
use solana_rpc_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;
use std::time::Instant;
use dashmap::DashSet;

#[derive(Debug, Deserialize)]
pub struct HistoryRequest {
    pub accounts: Vec<ChainAccount>,
    pub before: Option<String>,
    pub limit: Option<usize>,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct SignatureRequest {
    pub address: String,
    pub limit: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct SignatureResponse {
    pub signatures: Vec<String>,
}


#[derive(Debug, Deserialize)]
pub struct TransactionParseRequest {
    pub address: String,
    pub signatures: Vec<String>,
}


#[derive(Debug, Deserialize)]
pub struct ChainAccount {
    pub chainId: String,
    pub address: String,
}

#[derive(Debug, Serialize)]
pub struct PhantomHistoryResponse {
    pub results: Vec<NormalizedTx>,
}

#[derive(Debug, Serialize)]
pub struct NormalizedTx {
    pub id: String,
    pub timestamp: u64,
    pub interactionData: InteractionData,
    pub chainMeta: ChainMeta,
}

#[derive(Debug, Serialize)]
pub struct InteractionData {
    pub transactionType: String,
    pub balanceChanges: Vec<BalanceChange>,
}

#[derive(Debug, Serialize)]
pub struct BalanceChange {
    pub amount: String,
    pub from: String,
    pub to: String,
    pub token: TokenInfo,
}

#[derive(Debug, Serialize)]
pub struct SolflareSignature {
    pub hash: String,
    pub block_time: u64,
    pub slot: u64,
    pub err: Option<String>,
    pub public_key: String,
}


#[derive(Debug, Serialize)]
pub struct TokenInfo {
    pub id: String,
    pub displayName: String,
    pub symbol: String,
    pub decimals: u8,
    pub logoURI: String,
}

#[derive(Debug, Serialize)]
pub struct ChainMeta {
    pub transactionId: String,
    pub status: String,
    pub networkFee: String,
}

#[derive(Debug, Clone)]
struct TokenMetadata {
    pub(crate) name: String,
    pub(crate) symbol: String,
    logoURI: String,
    pub(crate) decimals: u8,
}

const MAX_RETRIES: usize = 3;
const RETRY_DELAYS: [u64; 3] = [1, 1, 1];
const SOL_MINT: &str = "So11111111111111111111111111111111111111112";

async fn get_parsed_transaction_solflare(
    signatures: Vec<String>,
    wallet: &Pubkey,
) -> Result<Vec<NormalizedTx>> {
    let client = REQWEST_CLIENT.get().unwrap();
    let start = Instant::now();

    let body = json!({
        "language": "en",
        "layout": "web",
        "address": wallet.to_string(),
        "signatures": signatures,
    });

    let response = client
        .post("https://activity-api.solflare.com/v1/transactions?network=mainnet")
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
        .json(&body)
        .send()
        .await?;

    println!("[timing] Solflare API call took {:?}", start.elapsed());

    let raw_text = response.text().await?;
    let chunks = raw_text.split("<|EOF|>").filter(|c| !c.trim().is_empty());

    let mut results = Vec::new();

    for chunk in chunks {
        let json: Value = match serde_json::from_str(chunk.trim()) {
            Ok(v) => v,
            Err(e) => {
                eprintln!("Error decoding JSON chunk: {e}");
                continue;
            }
        };

        if let Some(arr) = json["data"].as_array() {
            for tx in arr {
                if let Some(tx) = tx.as_object() {
                    if let Some(normalized) = parse_solflare_tx(tx.clone(), wallet) {
                        results.push(normalized);
                    }
                }
            }
        }
    }

    Ok(results)
}
pub async fn handle_parse_transactions(
    req: TransactionParseRequest,
) -> Result<impl Reply, warp::Rejection> {
    let pubkey = match req.address.parse::<Pubkey>() {
        Ok(pk) => pk,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&"Invalid public key"),
                StatusCode::BAD_REQUEST,
            ));
        }
    };

    match get_parsed_transaction_solflare(req.signatures, &pubkey).await {
        Ok(results) => Ok(warp::reply::with_status(
            warp::reply::json(&PhantomHistoryResponse { results }),
            StatusCode::OK,
        )),
        Err(err) => {
            eprintln!("Failed to fetch Solflare transactions: {}", err);
            Ok(warp::reply::with_status(
                warp::reply::json(&"Failed to fetch transactions"),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}



pub fn parse_solflare_tx(tx: serde_json::Map<String, Value>, wallet: &Pubkey) -> Option<NormalizedTx> {
    let hash = tx.get("hash")?.as_str().unwrap_or_default();
    let wallet_str = wallet.to_string();

    // Parse timestamp
    let props = tx
        .get("components")?
        .get("lineItem")?
        .get("props")?
        .as_array()?;

    let timestamp = props
        .iter()
        .find(|p| p["name"] == "blockTime")
        .and_then(|p| p["value"].as_u64())
        .unwrap_or_default();

    // Determine transaction type
    let tx_type = if let Some(tx_type) = tx.get("type").and_then(|t| t.as_str()) {
        if tx_type.contains("RECEIVED") {
            "RECEIVED"
        } else if tx_type.contains("INTERACTED_WITH_APP") {
            "APP INTERACTION"
        } else {
            match tx_type {
                "SENT_TOKEN" => "SENT",
                "CLOSED_ATA" => "CLOSED ACCOUNT",
                _ => "UNKNOWN",
            }
        }
    } else {
        "UNKNOWN"
    };

    // Parse addresses from transaction details
    let (mut sender, mut recipient) = ("unknown".into(), "unknown".into());
    if let Some(expanded) = tx.get("expandedData") {
        if let Some(details) = expanded.get("details").and_then(|d| d.as_array()) {
            sender = details.get(0)
                .and_then(|d| d.get("props"))
                .and_then(|p| p.as_array())
                .and_then(|p| p.iter().find(|i| i["name"] == "content"))
                .and_then(|c| c["value"].as_str())
                .unwrap_or("unknown")
                .to_string();

            recipient = details.get(2)
                .and_then(|d| d.get("props"))
                .and_then(|p| p.as_array())
                .and_then(|p| p.iter().find(|i| i["name"] == "content"))
                .and_then(|c| c["value"].as_str())
                .unwrap_or("unknown")
                .to_string();
        }
    }

    // Parse balance changes
    let balances = props
        .iter()
        .find(|p| p["name"] == "balances")
        .and_then(|p| p["value"]["props"].as_array());

    let status = balances.as_ref()
        .and_then(|b| b.iter().find(|p| p["name"] == "failedText"))
        .map(|p| p["value"].as_str() == Some("Failed"))
        .unwrap_or(false);

    let mut changes = Vec::new();

    // Helper to parse token info
    let parse_token = |t: &Value| -> Option<(String, String, String, u8)> {
        Some((
            t["amount"].as_str().unwrap_or("0").to_string(),
            t["symbol"].as_str().unwrap_or("UNKNOWN").to_string(),
            t["image"].as_str().unwrap_or("").to_string(),
            t["decimals"].as_u64().unwrap_or(0) as u8,
        ))
    };

    // Process positive balances (received)
    if let Some(positives) = balances.as_ref()
        .and_then(|b| b.iter().find(|p| p["name"] == "positives"))
        .and_then(|p| p["value"].as_array())
    {
        for t in positives {
            if let Some((amount, symbol, image, decimals)) = parse_token(t) {
                changes.push(BalanceChange {
                    amount,
                    from: sender.clone(),
                    to: wallet_str.clone(),
                    token: TokenInfo {
                        id: format!("solana:101/address:{}", symbol),
                        displayName: symbol.clone(),
                        symbol,
                        decimals,
                        logoURI: image,
                    },
                });
            }
        }
    }

    // Process negative balances (sent)
    if let Some(negatives) = balances.as_ref()
        .and_then(|b| b.iter().find(|p| p["name"] == "negatives"))
        .and_then(|p| p["value"].as_array())
    {
        for t in negatives {
            if let Some((amount, symbol, image, decimals)) = parse_token(t) {
                changes.push(BalanceChange {
                    amount,
                    from: wallet_str.clone(),
                    to: recipient.clone(),
                    token: TokenInfo {
                        id: format!("solana:101/address:{}", symbol),
                        displayName: symbol.clone(),
                        symbol,
                        decimals,
                        logoURI: image,
                    },
                });
            }
        }
    }

    // Parse network fee
    let fee = tx.get("fee")
        .and_then(|v| match v {
            Value::Number(n) => Some(n.to_string()),
            Value::String(s) => Some(s.clone()),
            _ => None,
        })
        .unwrap_or_else(|| "0".into());

    Some(NormalizedTx {
        id: format!("solana:101/tx:{}", hash),
        timestamp,
        interactionData: InteractionData {
            transactionType: tx_type.to_string(),
            balanceChanges: changes,
        },
        chainMeta: ChainMeta {
            transactionId: hash.into(),
            status: if status { "failed" } else { "success" }.into(),
            networkFee: fee,
        },
    })
}



pub async fn fetch_token_metadata(mint: &str) -> Option<TokenMetadata> {
    println!("Fetching token metadata for mint: {}", mint);

    let fetch_token_metadata  = Instant::now();
    // First: try local metadata API
    let client = Client::new();
    if let Ok(response) = client
        .get(&format!("http://localhost:7777/api/searchTokensByMint?query={}", mint))
        .send()
        .await
    {
        if let Ok(json) = response.json::<Value>().await {
            if let Some(result) = json.get("result") {
                let symbol = result["symbol"].as_str().unwrap_or("UNKNOWN");
                if symbol != "UNKNOWN" {
                    let name = result["name"].as_str().unwrap_or("Unknown Token");
                    let logo_uri = result["logoURI"].as_str().unwrap_or("");
                    let decimals = result["decimals"].as_u64().unwrap_or(0);
                    println!(
                        "[timing] Total fetch_token_metadata duration: {:?}",
                        fetch_token_metadata.elapsed()
                    );

                    return Some(TokenMetadata {
                        name: name.to_string(),
                        symbol: symbol.to_string(),
                        logoURI: logo_uri.to_string(),
                        decimals: decimals as u8,
                    });

                }
            }
        }
    }

    // // Fallback to Metaplex on-chain metadata
    // if let Ok(mint_pubkey) = Pubkey::from_str(mint) {
    //     let (metadata_pda, _) = Pubkey::find_program_address(
    //         &[b"metadata", TOKEN_METADATA_PROGRAM_ID.as_ref(), mint_pubkey.as_ref()],
    //         &TOKEN_METADATA_PROGRAM_ID,
    //     );

    //     // Replace with your method to get a random Helius RPC URL
    //     let rpc_url = "https://api.mainnet-beta.solana.com"; // Example RPC URL
    //     let rpc_client = RpcClient::new_with_commitment(rpc_url.to_string(), CommitmentConfig::finalized());
    //
    //     for attempt in 0..3 {
    //         match rpc_client.get_account_data(&metadata_pda) {
    //             Ok(data) => {
    //                 if let Ok(metadata) = Metadata::from_bytes(&data) {
    //                     return Some(TokenMetadata {
    //                         name: metadata.name.trim_matches(char::from(0)).to_string(),
    //                         symbol: metadata.symbol.trim_matches(char::from(0)).to_string(),
    //                         logo_uri: "".to_string(),
    //                         decimals: 0, // Decimals not available from Metaplex metadata
    //                     });
    //                 }
    //             }
    //             Err(_) => {
    //                 if attempt < 2 {
    //                     sleep(Duration::from_millis(500)).await;
    //                 } else {
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // }


    None
}


async fn async_normalize_transaction(tx_data: Value, wallet: &Pubkey) -> Option<NormalizedTx> {
    println!("Normalizing transaction data for wallet: {}", wallet);
    let async_normalize_transaction  = Instant::now();

    let meta = tx_data.get("meta")?.as_object()?;
    let block_time = tx_data.get("blockTime")?.as_u64()?;
    let signature = tx_data["transaction"]["signatures"].get(0)?.as_str()?;
    let message = tx_data["transaction"]["message"].as_object()?;
    let account_keys = message.get("accountKeys")?.as_array()?;

    let wallet_address = wallet.to_string();
    let mut balance_changes = Vec::new();

    // Process SOL balance changes
    if let Some(wallet_index) = account_keys.iter().position(|k| k.as_str() == Some(&wallet_address)) {
        let pre_balances = meta.get("preBalances")?.as_array()?;
        let post_balances = meta.get("postBalances")?.as_array()?;

        println!("{:?}", pre_balances);
        println!("{:?}", post_balances);

        let pre_sol = pre_balances.get(wallet_index).and_then(|v| v.as_u64()).unwrap_or(0);
        let post_sol = post_balances.get(wallet_index).and_then(|v| v.as_u64()).unwrap_or(0);
        let delta_sol = post_sol as i64 - pre_sol as i64;

        if delta_sol != 0 {
            let amount = delta_sol.abs() as f64 / 1e9;
            let (from, to) = if delta_sol > 0 {
                ("unknown", &wallet_address)
            } else {
                (wallet_address.as_str(), &"unknown".to_string())
            };
            balance_changes.push(create_sol_change(&from.to_string(), to, amount));
        }

        // Process fee as separate balance change
        let fee = meta.get("fee").and_then(|f| f.as_u64()).unwrap_or(0);
        if fee > 0 {
            balance_changes.push(create_sol_change(&wallet_address, &"solana:101/fee".to_string(), fee as f64 / 1e9));
        }
    }

    // Process token balance changes
    let pre_token_balances = meta.get("preTokenBalances")?.as_array()?;
    let post_token_balances = meta.get("postTokenBalances")?.as_array()?;

    // Get all mints with balance changes for this wallet
    let mut mints = HashSet::new();
    for balance in pre_token_balances.iter().chain(post_token_balances.iter()) {
        if balance["owner"].as_str() == Some(&wallet_address) {
            if let Some(mint) = balance["mint"].as_str() {
                if mint != SOL_MINT {
                    mints.insert(mint.to_string());
                }
            }
        }
    }

    // Fetch metadata for all mints concurrently
    let metadata_map = fetch_metadata_concurrently(mints.clone()).await;

    // Calculate balance changes per mint
    for mint in mints {
        let pre_amount = sum_token_balances(&pre_token_balances, &wallet_address, &mint);
        let post_amount = sum_token_balances(&post_token_balances, &wallet_address, &mint);
        let delta = post_amount - pre_amount;

        if delta == 0.0 {
            continue;
        }


        let metadata = metadata_map.get(&mint).cloned().unwrap_or_else(|| TokenMetadata {
            name: "Unknown Token".into(),
            symbol: "UNKNOWN".into(),
            logoURI: "".into(),
            decimals: get_decimals_from_balance(&pre_token_balances, &post_token_balances, &mint),
        });

        let (from, to) = if delta > 0.0 {
            ("unknown", &wallet_address)
        } else {
            (wallet_address.as_str(), &"unknown".to_string())
        };

        balance_changes.push(BalanceChange {
            amount: delta.abs().to_string(),
            from: format_address(&from.to_string()),
            to: format_address(to),
            token: TokenInfo {
                id: format!("solana:101/address:{}", mint),
                displayName: metadata.name,
                symbol: metadata.symbol,
                decimals: metadata.decimals,
                logoURI: metadata.logoURI,
            },
        });
    }

    if balance_changes.is_empty() {
        return None;
    }

    println!(
        "[timing] Total async_normalize_transaction duration: {:?}",
        async_normalize_transaction.elapsed()
    );

    Some(NormalizedTx {
        id: format!("solana:101/tx:{}", signature),
        timestamp: block_time,
        interactionData: InteractionData {
            transactionType: "TRANSFER".into(),
            balanceChanges: balance_changes,
        },
        chainMeta: ChainMeta {
            transactionId: signature.to_string(),
            status: if meta.get("err")?.is_null() { "success" } else { "failed" }.into(),
            networkFee: meta.get("fee").and_then(|f| f.as_u64()).unwrap_or(0).to_string(),
        },
    })
}

fn sum_token_balances(balances: &[Value], owner: &str, mint: &str) -> f64 {
    balances.iter()
        .filter(|b|
            b["owner"].as_str() == Some(owner) &&
                b["mint"].as_str() == Some(mint)
        )
        .filter_map(|b| b["uiTokenAmount"]["uiAmount"].as_f64())
        .sum()
}


fn get_decimals_from_balance(pre: &[Value], post: &[Value], mint: &str) -> u8 {
    // Check pre balances first
    pre.iter()
        .chain(post.iter())
        .find(|b| b["mint"].as_str() == Some(mint))
        .and_then(|b| b["uiTokenAmount"]["decimals"].as_u64())
        .map(|d| d as u8)
        .unwrap_or(0)
}

async fn get_parsed_transaction(signature: &str) -> Result<Value> {
    println!("Fetching transaction data for signature: {}", signature);
    let mut attempts = 0;
    let mut rpc_url = "http://frankfurt.o7node.com:7799";
    let get_parsed_transaction  = Instant::now();
    loop {
        let request_body = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTransaction",
            "params": [
                signature,
                {
                    "encoding": "jsonParsed",
                    "maxSupportedTransactionVersion": 0,
                    "commitment": "confirmed"
                }
            ]
        });

        match REQWEST_CLIENT.get().unwrap()
            .post(rpc_url)
            .json(&request_body)
            .send()
            .await
        {
            Ok(response) => {
                println!(
                    "[timing] Total get_parsed_transaction duration: {:?}",
                    get_parsed_transaction.elapsed()
                );
                let json: Value = response.json().await?;
                if let Some(result) = json["result"].as_object() {
                    return Ok(json!(result));
                }
            }
            Err(e) => {
                if attempts >= MAX_RETRIES {
                    return Err(e.into());
                }
                tokio::time::sleep(Duration::from_secs(RETRY_DELAYS[attempts] / 5)).await;
                attempts += 1;
            }
        }
    }
}
async fn fetch_transactions(
    pubkey: &Pubkey,
    before: Option<String>,
    until: Option<String>,
    limit: usize
) -> Result<Vec<Value>> {
    println!("Fetching transactions for pubkey: {}", pubkey);
    let mut attempts = 0;
    let mut rpc_url = get_random_helius_rpc().await.unwrap();
    let fetch_transactions  = Instant::now();
    println!("{:?}", before);
    println!("{:?}", limit);
    println!("{:?}", until);
    loop {
        let request_body = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getSignaturesForAddress",
            "params": [
                pubkey.to_string(),
                {
                    "limit": limit,
                    "before": before,
                    "until": until,
                    "commitment": "confirmed"
                }
            ]
        });

        match REQWEST_CLIENT.get().unwrap()
            .post(&rpc_url)
            .json(&request_body)
            .send()
            .await
        {
            Ok(response) => {
                let json: Value = response.json().await?;
                println!(
                    "[timing] Total fetch_transactions duration: {:?}",
                    fetch_transactions.elapsed()
                );
                if let Some(result) = json["result"].as_array() {
                    return Ok(result.clone());
                }
            }
            Err(e) => {
                if attempts >= MAX_RETRIES {
                    return Err(e.into());
                }
                tokio::time::sleep(Duration::from_secs(RETRY_DELAYS[attempts] / 5)).await;
                attempts += 1;
                rpc_url = get_random_helius_rpc().await.unwrap();
                println!("{:?}", rpc_url);
            }
        }
    }
}

pub async fn fetch_solflare_signatures(pubkey: &Pubkey, limit: usize) -> Result<Vec<SolflareSignature>> {
    let client = Client::new();
    let url = format!(
        "https://activity-api.solflare.com/v1/signatures?address={}&network=mainnet&ignoreFailed=0&limit={}",
        pubkey.to_string(),
        limit
    );

    let response = client
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
        .send()
        .await?
        .text()
        .await?;

    let mut signatures = Vec::new();
    for chunk in response.split("<|EOF|>") {
        if chunk.trim().is_empty() {
            continue;
        }

        match serde_json::from_str::<Value>(chunk.trim()) {
            Ok(json) => {
                if let Some(data) = json["data"].as_array() {
                    for entry in data {
                        let hash = entry.get("hash").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        let block_time = entry.get("blockTime").and_then(|v| v.as_u64()).unwrap_or(0);
                        let slot = entry.get("slot").and_then(|v| v.as_u64()).unwrap_or(0);
                        let public_key = entry.get("publicKey").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        let err = entry.get("err").and_then(|v| v.as_str()).map(|s| s.to_string());

                        if hash.is_empty() {
                            continue; // Skip malformed entries
                        }

                        signatures.push(SolflareSignature {
                            hash,
                            block_time,
                            slot,
                            err,
                            public_key,
                        });
                    }
                }
            }
            Err(e) => {
                eprintln!("[warn] Skipped malformed chunk: {}", e);
                continue;
            }
        }
    }

    Ok(signatures)
}

async fn fetch_metadata_concurrently(mints: HashSet<String>) -> HashMap<String, TokenMetadata> {
    println!("Fetching metadata for mints: {:?}", mints);
    let mut metadata_futures = FuturesUnordered::new();
    for mint in mints {
        metadata_futures.push(async move {
            let metadata = fetch_token_metadata(&mint).await;
            (mint, metadata)
        });
    }

    let mut metadata_map = HashMap::new();
    while let Some((mint, metadata)) = metadata_futures.next().await {
        if let Some(metadata) = metadata {
            metadata_map.insert(mint, metadata);
        }
    }
    metadata_map
}

// Update handle_history to use async normalization
pub async fn handle_history(req: HistoryRequest) -> Result<impl Reply, warp::Rejection> {
    let total_start = Instant::now();
    let seen_signatures = SEEN_SIGNATURES.get_or_init(DashSet::new);

    let mut all_tx = Vec::new();

    for acc in req.accounts {
        if acc.chainId != "solana:101" {
            continue;
        }

        let before = req.before.clone();
        let limit = req.limit.unwrap_or(10);

        let pubkey = match acc.address.parse::<Pubkey>() {
            Ok(pk) => pk,
            Err(_) => continue,
        };

        println!("Fetching transactions for pubkey: {}", pubkey);

        let solflare_sigs = match fetch_solflare_signatures(&pubkey, limit).await {
            Ok(sigs) => sigs,
            Err(err) => {
                eprintln!("Failed to fetch Solflare signatures for {}: {}", pubkey, err);
                continue;
            }
        };

        let signatures: Vec<String> = solflare_sigs.iter().map(|s| s.hash.clone()).collect();

        println!("Fetched signatures for pubkey: {:?}", signatures);

        let txs: Vec<NormalizedTx> = match get_parsed_transaction_solflare(signatures, &pubkey).await {
            Ok(txs) => txs,
            Err(err) => {
                eprintln!("Error processing tx: {}", err);
                vec![]
            }
        };

        all_tx.extend(txs);



    }

    println!("[timing] Total handle_history duration: {:?}", total_start.elapsed());

    Ok(warp::reply::with_status(
        warp::reply::json(&PhantomHistoryResponse { results: all_tx }),
        StatusCode::OK,
    ))
}


pub async fn handle_signatures(req: SignatureRequest) -> Result<impl Reply, warp::Rejection> {
    let pubkey = match Pubkey::from_str(&req.address) {
        Ok(pk) => pk,
        Err(_) => {
            return Ok(warp::reply::with_status(
                warp::reply::json(&"Invalid pubkey"),
                StatusCode::BAD_REQUEST,
            ));
        }
    };

    let limit = req.limit.unwrap_or(20);

    match fetch_solflare_signatures(&pubkey, limit).await {
        Ok(sigs) => {
            let hashes: Vec<String> = sigs.into_iter().map(|s| s.hash).collect();
            Ok(warp::reply::with_status(
                warp::reply::json(&SignatureResponse { signatures: hashes }),
                StatusCode::OK,
            ))
        }
        Err(err) => {
            eprintln!("Error fetching signatures: {}", err);
            Ok(warp::reply::with_status(
                warp::reply::json(&"Failed to fetch signatures"),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}







fn create_sol_change(from: &String, to: &String, amount: f64) -> BalanceChange {
    BalanceChange {
        amount: amount.to_string(),
        from: format_address(from),
        to: format_address(to),
        token: TokenInfo {
            id: "solana:101/nativeToken:501".into(),
            displayName: "SOL".into(),
            symbol: "SOL".into(),
            decimals: 9,
            logoURI: SOL_LOGO.into(),
        },
    }
}

fn create_token_change(from: &String, to: &String, amount: f64, mint: &String, decimals: u8) -> BalanceChange {
    BalanceChange {
        amount: amount.to_string(),
        from: format_address(from),
        to: format_address(to),
        token: TokenInfo {
            id: format!("solana:101/address:{}", mint),
            displayName: "Token".into(),
            symbol: "TOKEN".into(),
            decimals,
            logoURI: "".into(),
        },
    }
}

fn format_address(address: &String) -> String {
    format!("solana:101/address:{}", address)
}

const SOL_LOGO: &str = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";



use tokio;

#[tokio::test]
async fn test_token_metadata_resolution() {
    dotenv().ok();
    REQWEST_CLIENT.set(Client::new()).unwrap();
    let test_cases = vec![
        ("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC"), // Known: USDC
        ("So11111111111111111111111111111111111111112", "SOL"),   // Native SOL
        ("BPKmXu2qwDjMNEQnqmNPvBYCshgVmJVCe624JnVRP7MJ", ""),      // Unknown/local failure → on-chain
        ("DVuaDuQdPZ6H49inC2Xoyx7BpLAAJTPPChSfHuGpy8X4", ""),      // Possibly non-listed
        ("11111111111111111111111111111111", ""),                 // Likely invalid
    ];

    for (mint, expected_symbol) in test_cases {
        println!("Checking mint: {}", mint);
        let result = fetch_token_metadata(mint).await;

        match result {
            Some(metadata) => {
                println!(
                    "- Resolved: {} | Symbol: {} | Decimals: {}",
                    metadata.name, metadata.symbol, metadata.decimals
                );

                // Basic assertions
                assert!(
                    !metadata.symbol.trim().is_empty(),
                    "Symbol should not be empty"
                );

                if !expected_symbol.is_empty() {
                    assert_eq!(
                        metadata.symbol,
                        expected_symbol,
                        "Expected symbol {} for mint {}",
                        expected_symbol,
                        mint
                    );
                }
            }
            None => {
                println!("- Failed to resolve metadata.");
                // For mints where we expect something, fail the test
                if !expected_symbol.is_empty() {
                    panic!("Expected to resolve symbol for mint: {}", mint);
                }
            }
        }
    }
}
