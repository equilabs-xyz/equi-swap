use crate::api_methods::handle_history::{
    handle_history, handle_parse_transactions, handle_signatures,
};
use crate::api_methods::jito::handle_jito_tip_floor;
use crate::api_methods::search_tokens::{
    get_capped_tokens_handler, search_token_by_mint_handler, search_tokens_handler,
};
use crate::api_methods::wallet_data::wallet_data_handler;
use std::collections::HashMap;
use warp::Filter;

pub fn api_routes() -> warp::filters::BoxedFilter<(impl warp::Reply,)> {
    let search_tokens_by_name = warp::path("api")
        .and(warp::path("searchTokensByName"))
        .and(warp::get())
        .and(warp::query::<HashMap<String, String>>())
        .and_then(search_tokens_handler);

    let search_tokens_by_mint = warp::path("api")
        .and(warp::path("searchTokensByMint"))
        .and(warp::get())
        .and(warp::query::<HashMap<String, String>>())
        .and_then(search_token_by_mint_handler);

    let search_tokens_by_mint = warp::path("api")
        .and(warp::path("searchToken"))
        .and(warp::get())
        .and(warp::query::<HashMap<String, String>>())
        .and_then(get_capped_tokens_handler);

    let handle_history_route = warp::path("api")
        .and(warp::path("history"))
        .and(warp::post())
        .and(warp::body::json())
        .and_then(handle_history);

    let wallet_route = warp::path("api")
        .and(warp::path("wallet"))
        .and(warp::get())
        .and(warp::query::<HashMap<String, String>>())
        .and_then(wallet_data_handler);

    let signatures_route = warp::path!("api" / "signatures")
        .and(warp::post())
        .and(warp::body::json())
        .and_then(handle_signatures);

    let parse_transactions_route = warp::path!("api" / "fetchTransactions")
        .and(warp::post())
        .and(warp::body::json())
        .and_then(handle_parse_transactions);

    let jito_tip_floor_route = warp::path!("api" / "fetchJitoTipFloor")
        .and(warp::get())
        .and_then(handle_jito_tip_floor);

    search_tokens_by_mint
        .or(search_tokens_by_name)
        .or(handle_history_route)
        .or(wallet_route)
        .or(signatures_route)
        .or(parse_transactions_route)
        .or(jito_tip_floor_route)
        .boxed()
}
