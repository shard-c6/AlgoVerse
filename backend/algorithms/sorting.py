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
        
        return self.create_contract(mode, time_ms, arr)

class QuickSortRunner(AlgorithmRunner):
    def __init__(self):
        super().__init__(
            algorithm_name="quicksort",
            complexity=AlgorithmComplexity(time="O(n log n)", space="O(log n)")
        )

    def run(self, input_data: List[int], mode: AlgorithmMode):
        arr = list(input_data)
        start_time = time.time()
        self.events = []
        self.comparisons = 0
        self.swaps = 0

        def partition(low, high):
            pivot = arr[high]
            i = low - 1
            for j in range(low, high):
                self.comparisons += 1
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.COMPARISON, "compare pivot", indices=[j, high], values=[arr[j], pivot])
                
                if arr[j] <= pivot:
                    i += 1
                    arr[i], arr[j] = arr[j], arr[i]
                    self.swaps += 1
                    if mode == AlgorithmMode.VISUALIZATION:
                        self.add_event(EventCategory.ARRAY_MUTATION, "swap", indices=[i, j], values=[arr[i], arr[j]])
            
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            self.swaps += 1
            if mode == AlgorithmMode.VISUALIZATION:
                self.add_event(EventCategory.ARRAY_MUTATION, "swap pivot", indices=[i + 1, high], values=[arr[i + 1], arr[high]])
            return i + 1

        def quick_sort(low, high):
            if low < high:
                pi = partition(low, high)
                quick_sort(low, pi - 1)
                quick_sort(pi + 1, high)

        quick_sort(0, len(arr) - 1)
        end_time = time.time()
        time_ms = (end_time - start_time) * 1000
        return self.create_contract(mode, time_ms, arr)

class MergeSortRunner(AlgorithmRunner):
    def __init__(self):
        super().__init__(
            algorithm_name="mergesort",
            complexity=AlgorithmComplexity(time="O(n log n)", space="O(n)")
        )

    def run(self, input_data: List[int], mode: AlgorithmMode):
        arr = list(input_data)
        start_time = time.time()
        self.events = []
        self.comparisons = 0
        self.swaps = 0

        def merge_sort(l, r):
            if l < r:
                m = (l + r) // 2
                merge_sort(l, m)
                merge_sort(m + 1, r)
                merge(l, m, r)

        def merge(l, m, r):
            left = arr[l:m+1]
            right = arr[m+1:r+1]
            i = j = 0
            k = l
            
            while i < len(left) and j < len(right):
                self.comparisons += 1
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.COMPARISON, "compare", indices=[l+i, m+1+j], values=[left[i], right[j]])
                
                if left[i] <= right[j]:
                    arr[k] = left[i]
                    i += 1
                else:
                    arr[k] = right[j]
                    j += 1
                
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.ARRAY_MUTATION, "overwrite", indices=[k], values=[arr[k]])
                k += 1

            while i < len(left):
                arr[k] = left[i]
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.ARRAY_MUTATION, "overwrite", indices=[k], values=[arr[k]])
                i += 1
                k += 1

            while j < len(right):
                arr[k] = right[j]
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.ARRAY_MUTATION, "overwrite", indices=[k], values=[arr[k]])
                j += 1
                k += 1

        merge_sort(0, len(arr) - 1)
        end_time = time.time()
        time_ms = (end_time - start_time) * 1000
        return self.create_contract(mode, time_ms, arr)

class InsertionSortRunner(AlgorithmRunner):
    def __init__(self):
        super().__init__(
            algorithm_name="insertionsort",
            complexity=AlgorithmComplexity(time="O(n^2)", space="O(1)")
        )

    def run(self, input_data: List[int], mode: AlgorithmMode):
        arr = list(input_data)
        n = len(arr)
        start_time = time.time()
        self.events = []
        self.comparisons = 0
        self.swaps = 0

        for i in range(1, n):
            key = arr[i]
            j = i - 1
            while j >= 0:
                self.comparisons += 1
                if mode == AlgorithmMode.VISUALIZATION:
                    self.add_event(EventCategory.COMPARISON, "compare", indices=[j, j+1], values=[arr[j], key])
                
                if arr[j] > key:
                    arr[j + 1] = arr[j]
                    if mode == AlgorithmMode.VISUALIZATION:
                        self.add_event(EventCategory.ARRAY_MUTATION, "shift", indices=[j+1], values=[arr[j+1]])
                    j -= 1
                else:
                    break
            arr[j + 1] = key
            if mode == AlgorithmMode.VISUALIZATION:
                self.add_event(EventCategory.ARRAY_MUTATION, "insert", indices=[j+1], values=[arr[j+1]])

        end_time = time.time()
        time_ms = (end_time - start_time) * 1000
        return self.create_contract(mode, time_ms, arr)
