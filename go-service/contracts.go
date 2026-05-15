package main

type AlgorithmMode string

const (
	Visualization AlgorithmMode = "visualization"
	Benchmark     AlgorithmMode = "benchmark"
)

type StateEvent struct {
	State       []int  `json:"state"`
	Event       string `json:"event"`
	Description string `json:"description"`
}

type PerformanceMetrics struct {
	TimeMs      float64 `json:"time_ms"`
	Comparisons int     `json:"comparisons"`
	Swaps       int     `json:"swaps"`
}

type Complexity struct {
	Time  string `json:"time"`
	Space string `json:"space"`
}

type VersionedAlgorithmContract struct {
	Version    string             `json:"version"`
	Language   string             `json:"language"`
	Algorithm  string             `json:"algorithm"`
	Mode       AlgorithmMode      `json:"mode"`
	FinalState []int              `json:"final_state,omitempty"`
	Events     []StateEvent       `json:"events,omitempty"`
	Metrics    PerformanceMetrics `json:"metrics,omitempty"`
	Complexity Complexity         `json:"complexity,omitempty"`
}

type RunRequest struct {
	Algorithm string `json:"algorithm"`
	Language  string `json:"language"`
	Data      []int  `json:"array"`
}
