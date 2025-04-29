use std::error::Error;
use std::sync::OnceLock;
use dotenv::dotenv;
use reqwest::Client;
use crate::server::start_server::start_server;
use dashmap::{DashMap, DashSet};
use crate::api_methods::search_tokens::TokenSearchResult;
use crate::cache::token_cache::{spawn_token_cache_loader, spawn_token_cache_updater};
use crate::rpc::spawn_rpc_health_checker::spawn_rpc_health_checker;

mod server;
mod api;
mod api_methods;
mod cache;
mod rpc;
pub static REQWEST_CLIENT: OnceLock<Client> = OnceLock::new();
pub static SEEN_SIGNATURES: OnceLock<DashSet<String>> = OnceLock::new();

pub static TOKEN_METADATA_CACHE: OnceLock<DashMap<String, TokenSearchResult>> = OnceLock::new();
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();
    REQWEST_CLIENT.set(Client::new()).unwrap();
    // spawn_rpc_health_checker();
    // spawn_token_cache_loader().await;
    // println!("[cache] Token cache loaded");
    // spawn_token_cache_updater();

    tokio::spawn(start_server());
    loop {
        std::thread::sleep(std::time::Duration::from_secs(60));
    }
}
