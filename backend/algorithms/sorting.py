from typing import List
import time
from algorithms.base import AlgorithmRunner
from contracts.models import AlgorithmComplexity, AlgorithmMode, EventCategory

class BubbleSortRunner(AlgorithmRunner):
    def __init__(self):
        super().__init__(
            algorithm_name="bubblesort",
            complexity=AlgorithmComplexity(time="O(n^2)", space="O(1)")
        )

    def run(self, input_data: List[int], mode: AlgorithmMode):
        arr = list(input_data)
        n = len(arr)
        start_time = time.time()
        
        self.events = []
        self.comparisons = 0
        self.swaps = 0

        for i in range(n):
            for j in range(0, n - i - 1):
                self.comparisons += 1
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.COMPARISON, "compare", indices=[j, j+1], values=[arr[j], arr[j+1]])
                
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
                    self.swaps += 1
                    if mode == AlgorithmMode.VISUALIZATION:
                        self.add_event(EventCategory.ARRAY_MUTATION, "swap", indices=[j, j+1], values=[arr[j], arr[j+1]])

        end_time = time.time()
        time_ms = (end_time - start_time) * 1000
        
        return self.create_contract(mode, time_ms)
