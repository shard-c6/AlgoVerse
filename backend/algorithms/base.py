from abc import ABC, abstractmethod
from typing import List, Any
import time
from contracts.models import (
    VersionedAlgorithmContract, 
    AlgorithmMetrics, 
    AlgorithmComplexity,
    AlgorithmMode,
    AlgorithmEvent,
    EventCategory
)

class AlgorithmRunner(ABC):
    def __init__(self, algorithm_name: str, complexity: AlgorithmComplexity):
        self.algorithm_name = algorithm_name
        self.complexity = complexity
        self.events = []
        self.comparisons = 0
        self.swaps = 0

    def add_event(self, category: EventCategory, event: str, indices: List[int] = None, values: List[Any] = None):
        self.events.append(AlgorithmEvent(
            timestamp=int(time.time() * 1000),
            category=category,
            event=event,
            indices=indices,
            values=values
        ))

    @abstractmethod
    def run(self, input_data: List[Any], mode: AlgorithmMode) -> VersionedAlgorithmContract:
        pass

    def create_contract(self, mode: AlgorithmMode, time_ms: float, final_state: List[int] = None) -> VersionedAlgorithmContract:
        return VersionedAlgorithmContract(
            algorithm=self.algorithm_name,
            language="python",
            mode=mode,
            events=self.events if mode == AlgorithmMode.VISUALIZATION else [],
            metrics=AlgorithmMetrics(
                comparisons=self.comparisons,
                swaps=self.swaps,
                time_ms=time_ms
            ),
            complexity=self.complexity,
            final_state=final_state
        )
