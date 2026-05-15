use axum::{
    routing::{post},
    Router,
    Json,
    extract::Path,
};
use serde::Deserialize;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use contracts::AlgorithmMode;

mod contracts;
mod algorithms;

#[derive(Deserialize)]
struct RunRequest {
    data: Vec<i32>,
}

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/visualize/:algo", post(visualize))
        .route("/benchmark/:algo", post(benchmark))
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8081));
    println!("Rust Execution Engine starting on port 8081...");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn visualize(Path(algo): Path<String>, Json(payload): Json<RunRequest>) -> Json<contracts::VersionedAlgorithmContract> {
    let result = algorithms::run_sort(&algo, payload.data, &AlgorithmMode::Visualization);
    Json(result)
}

async fn benchmark(Path(algo): Path<String>, Json(payload): Json<RunRequest>) -> Json<contracts::VersionedAlgorithmContract> {
    let result = algorithms::run_sort(&algo, payload.data, &AlgorithmMode::Benchmark);
    Json(result)
}
