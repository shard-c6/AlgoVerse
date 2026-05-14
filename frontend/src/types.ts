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
    values?: any[];
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
}
