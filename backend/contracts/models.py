from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import Enum

class AlgorithmMode(str, Enum):
    VISUALIZATION = "visualization"
    BENCHMARK = "benchmark"

class VisualizationLevel(str, Enum):
    MINIMAL = "minimal"
    EDUCATIONAL = "educational"
    VERBOSE = "verbose"

class EventCategory(str, Enum):
    ARRAY_MUTATION = "array_mutation"
    COMPARISON = "comparison"
    TRAVERSAL = "traversal"
    RECURSION = "recursion"
    BACKTRACKING = "backtracking"
    GRAPH_ACTION = "graph_action"

class AlgorithmEvent(BaseModel):
    timestamp: int
    category: EventCategory
    event: str
    indices: Optional[List[int]] = None
    values: Optional[List[Any]] = None
    metadata: Optional[dict] = None

class AlgorithmMetrics(BaseModel):
    comparisons: Optional[int] = 0
    swaps: Optional[int] = 0
    time_ms: float
    allocations: Optional[int] = 0
    memory_used_kb: Optional[float] = None

class AlgorithmComplexity(BaseModel):
    time: str
    space: str

class VersionedAlgorithmContract(BaseModel):
    version: str = "1.0"
    algorithm: str
    language: str
    mode: AlgorithmMode
    visualization_level: Optional[VisualizationLevel] = VisualizationLevel.EDUCATIONAL
    events: List[AlgorithmEvent] = []
    metrics: AlgorithmMetrics
    complexity: AlgorithmComplexity
