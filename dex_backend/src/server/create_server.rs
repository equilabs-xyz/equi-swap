use warp::Filter;
use warp_sessions::MemoryStore;
use crate::api::api_routes::api_routes;

pub fn create_server() -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    api_routes().with(warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST"])
        .allow_headers(vec!["Content-Type"]))
}


