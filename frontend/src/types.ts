export const AlgorithmMode = {
    VISUALIZATION: "visualization",
    BENCHMARK: "benchmark",
} as const;

export type AlgorithmMode = (typeof AlgorithmMode)[keyof typeof AlgorithmMode];

export const VisualizationLevel = {
    MINIMAL: "minimal",
    EDUCATIONAL: "educational",
    VERBOSE: "verbose",
} as const;

export type VisualizationLevel = (typeof VisualizationLevel)[keyof typeof VisualizationLevel];

export const EventCategory = {
    INITIAL: "initial",
    FINAL: "final",
    ARRAY_MUTATION: "array_mutation",
    COMPARISON: "comparison",
    TRAVERSAL: "traversal",
    RECURSION: "recursion",
    BACKTRACKING: "backtracking",
    GRAPH_ACTION: "graph_action",
} as const;

export type EventCategory = (typeof EventCategory)[keyof typeof EventCategory];

export interface AlgorithmEvent {
    timestamp: number;
    category: EventCategory;
    event: string;
    indices?: number[];
    values?: number[];
    description?: string;
    metadata?: Record<string, any>;
}

export interface AlgorithmMetrics {
    comparisons?: number;
    swaps?: number;
    time_ms: number;
    allocations?: number;
    memory_used_kb?: number;
}

export interface AlgorithmComplexity {
    time: string;
    space: string;
}

export interface VersionedAlgorithmContract {
    version: string;
    algorithm: string;
    language: string;
    mode: AlgorithmMode;
    visualization_level?: VisualizationLevel;
    events: AlgorithmEvent[];
    metrics: AlgorithmMetrics;
    complexity: AlgorithmComplexity;
    final_state?: number[];
}

export interface BenchmarkRun {
    id: number;
    algorithm_id: number;
    language: string;
    input_size: number;
    execution_time_ms: number;
    comparisons?: number;
    swaps?: number;
    allocations?: number;
    memory_used_kb?: number;
    run_date: string;
}
