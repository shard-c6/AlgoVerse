package main

type AlgorithmMode string

const (
	Visualization AlgorithmMode = "visualization"
	Benchmark     AlgorithmMode = "benchmark"
)

type EventCategory string

const (
	Initial       EventCategory = "initial"
	Final         EventCategory = "final"
	ArrayMutation EventCategory = "array_mutation"
	Comparison    EventCategory = "comparison"
	Traversal     EventCategory = "traversal"
)

type AlgorithmEvent struct {
	Timestamp   int64         `json:"timestamp"`
	Category    EventCategory `json:"category"`
	Event       string        `json:"event"`
	Indices     []int         `json:"indices,omitempty"`
	Values      []int         `json:"values,omitempty"`
	Description string        `json:"description,omitempty"`
	State       []int         `json:"state,omitempty"` // Legacy support
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
	Events     []AlgorithmEvent   `json:"events,omitempty"`
	Metrics    PerformanceMetrics `json:"metrics,omitempty"`
	Complexity Complexity         `json:"complexity,omitempty"`
}

type RunRequest struct {
	Algorithm string `json:"algorithm"`
	Language  string `json:"language"`
	Data      []int  `json:"array"`
}
