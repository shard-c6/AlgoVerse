use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum AlgorithmMode {
    Visualization,
    Benchmark,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum EventCategory {
    ArrayMutation,
    Comparison,
    Traversal,
    Recursion,
    Backtracking,
    GraphAction,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AlgorithmEvent {
    pub timestamp: f64,
    pub category: EventCategory,
    pub event: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub indices: Option<Vec<usize>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AlgorithmMetrics {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub comparisons: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub swaps: Option<u64>,
    pub time_ms: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub allocations: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memory_used_kb: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AlgorithmComplexity {
    pub time: String,
    pub space: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VersionedAlgorithmContract {
    pub version: String,
    pub algorithm: String,
    pub language: String,
    pub mode: AlgorithmMode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub visualization_level: Option<String>,
    pub events: Vec<AlgorithmEvent>,
    pub metrics: AlgorithmMetrics,
    pub complexity: AlgorithmComplexity,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub final_state: Option<Vec<serde_json::Value>>,
}
