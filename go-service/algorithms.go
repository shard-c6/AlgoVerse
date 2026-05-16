package main

import (
	"fmt"
	"time"
)

type SortingState struct {
	Mode        AlgorithmMode
	Events      []AlgorithmEvent
	Comparisons int
	Swaps       int
}

func (s *SortingState) lineMeta(line int) map[string]interface{} {
	if line <= 0 {
		return nil
	}
	return map[string]interface{}{"line_number": line}
}

func (s *SortingState) PushEvent(category EventCategory, event string, indices, values []int, desc string, line int) {
	if s.Mode == Visualization {
		s.Events = append(s.Events, AlgorithmEvent{
			Timestamp:   time.Now().UnixMilli(),
			Category:    category,
			Event:       event,
			Indices:     indices,
			Values:      values,
			Description: desc,
			Metadata:    s.lineMeta(line),
		})
	}
}

func (s *SortingState) Compare(a, b int, i, j int, line int) bool {
	s.Comparisons++
	if s.Mode == Visualization {
		s.PushEvent(Comparison, "compare", []int{i, j}, []int{a, b}, fmt.Sprintf("Comparing index %d and %d", i, j), line)
	}
	return a < b
}

func (s *SortingState) Swap(data []int, i, j int, line int) {
	data[i], data[j] = data[j], data[i]
	s.Swaps++
	if s.Mode == Visualization {
		s.PushEvent(ArrayMutation, "swap", []int{i, j}, []int{data[i], data[j]}, fmt.Sprintf("Swapped index %d and %d", i, j), line)
	}
}

func (s *SortingState) Mutation(data []int, i, val int, eventName, desc string, line int) {
	data[i] = val
	if s.Mode == Visualization {
		s.PushEvent(ArrayMutation, eventName, []int{i}, []int{val}, desc, line)
	}
}

func cloneData(data []int) []int {
	clone := make([]int, len(data))
	copy(clone, data)
	return clone
}

func runSort(algoName string, data []int, mode AlgorithmMode) VersionedAlgorithmContract {
	start := time.Now()

	state := SortingState{
		Mode:        mode,
		Events:      []AlgorithmEvent{},
		Comparisons: 0,
		Swaps:       0,
	}

	arr := cloneData(data)

	if mode == Visualization {
		state.PushEvent(Initial, "initial", nil, cloneData(arr), "Initial state", 0)
	}

	complexity := Complexity{Time: "O(n^2)", Space: "O(1)"}

	switch algoName {
	case "bubble_sort":
		bubbleSort(&state, arr)
	case "quick_sort":
		complexity.Time = "O(n log n)"
		quickSort(&state, arr, 0, len(arr)-1)
	case "merge_sort":
		complexity.Time = "O(n log n)"
		complexity.Space = "O(n)"
		mergeSort(&state, arr, 0, len(arr)-1)
	case "insertion_sort":
		insertionSort(&state, arr)
	case "selection_sort":
		selectionSort(&state, arr)
	case "heap_sort":
		complexity.Time = "O(n log n)"
		heapSort(&state, arr)
	case "shell_sort":
		complexity.Time = "O(n log n)"
		shellSort(&state, arr)
	}

	if mode == Visualization {
		state.PushEvent(Final, "final", nil, cloneData(arr), "Sorted state", 0)
	}

	elapsed := time.Since(start)

	var finalState []int
	if mode == Benchmark {
		finalState = arr
	}

	return VersionedAlgorithmContract{
		Version:    "1.0",
		Language:   "go",
		Algorithm:  algoName,
		Mode:       mode,
		FinalState: finalState,
		Events:     state.Events,
		Metrics: PerformanceMetrics{
			TimeMs:      float64(elapsed.Nanoseconds()) / 1e6,
			Comparisons: state.Comparisons,
			Swaps:       state.Swaps,
		},
		Complexity: complexity,
	}
}

// BUBBLE SORT
func bubbleSort(state *SortingState, data []int) {
	n := len(data)
	for i := 0; i < n; i++ {
		for j := 0; j < n-i-1; j++ {
			state.Comparisons++
			if state.Mode == Visualization {
				state.PushEvent(Comparison, "compare", []int{j, j + 1}, []int{data[j], data[j+1]}, fmt.Sprintf("Comparing %d and %d", data[j], data[j+1]), 5)
			}
			if data[j] > data[j+1] {
				state.Swap(data, j, j+1, 6)
			}
		}
	}
}


// QUICK SORT
func partition(state *SortingState, data []int, low, high int) int {
	pivot := data[high]
	i := low - 1
	for j := low; j < high; j++ {
		state.Comparisons++
		if state.Mode == Visualization {
			state.PushEvent(Comparison, "compare", []int{j, high}, []int{data[j], pivot}, "Comparing with pivot", 5)
		}
		if data[j] <= pivot {
			i++
			state.Swap(data, i, j, 7)
		}
	}
	state.Swap(data, i+1, high, 10)
	return i + 1
}

func quickSort(state *SortingState, data []int, low, high int) {
	if low < high {
		pi := partition(state, data, low, high)
		quickSort(state, data, low, pi-1)
		quickSort(state, data, pi+1, high)
	}
}

// MERGE SORT
func merge(state *SortingState, data []int, left, mid, right int) {
	n1 := mid - left + 1
	n2 := right - mid

	L := make([]int, n1)
	R := make([]int, n2)

	copy(L, data[left:mid+1])
	copy(R, data[mid+1:right+1])

	i, j, k := 0, 0, left
	for i < n1 && j < n2 {
		state.Comparisons++
		if state.Mode == Visualization {
			state.PushEvent(Comparison, "compare", []int{left + i, mid + 1 + j}, []int{L[i], R[j]}, "Comparing left and right elements", 10)
		}
		if L[i] <= R[j] {
			state.Mutation(data, k, L[i], "merge", "Merging from left", 10)
			i++
		} else {
			state.Mutation(data, k, R[j], "merge", "Merging from right", 10)
			j++
		}
		k++
	}

	for i < n1 {
		state.Mutation(data, k, L[i], "merge", "Merging remaining left", 13)
		i++
		k++
	}

	for j < n2 {
		state.Mutation(data, k, R[j], "merge", "Merging remaining right", 14)
		j++
		k++
	}
}

func mergeSort(state *SortingState, data []int, left, right int) {
	if left < right {
		mid := left + (right-left)/2
		mergeSort(state, data, left, mid)
		mergeSort(state, data, mid+1, right)
		merge(state, data, left, mid, right)
	}
}

// INSERTION SORT
func insertionSort(state *SortingState, data []int) {
	n := len(data)
	for i := 1; i < n; i++ {
		key := data[i]
		j := i - 1
		for j >= 0 {
			state.Comparisons++
			if state.Mode == Visualization {
				state.PushEvent(Comparison, "compare", []int{j, i}, []int{data[j], key}, "Comparing with key", 5)
			}
			if data[j] > key {
				state.Mutation(data, j+1, data[j], "shift", "Shifted element", 6)
				j--
			} else {
				break
			}
		}
		state.Mutation(data, j+1, key, "insert", "Inserted key", 9)
	}
}

// SELECTION SORT
func selectionSort(state *SortingState, data []int) {
	n := len(data)
	for i := 0; i < n; i++ {
		minIdx := i
		for j := i + 1; j < n; j++ {
			state.Comparisons++
			if state.Mode == Visualization {
				state.PushEvent(Comparison, "compare", []int{j, minIdx}, []int{data[j], data[minIdx]}, "Comparing for minimum", 6)
			}
			if data[j] < data[minIdx] {
				minIdx = j
			}
		}
		if minIdx != i {
			state.Swap(data, i, minIdx, 8)
		}
	}
}

// HEAP SORT
func heapify(state *SortingState, data []int, n, i int) {
	largest := i
	left := 2*i + 1
	right := 2*i + 2

	if left < n {
		state.Comparisons++
		if state.Mode == Visualization {
			state.PushEvent(Comparison, "compare", []int{left, largest}, []int{data[left], data[largest]}, "Comparing with largest", 4)
		}
		if data[left] > data[largest] {
			largest = left
		}
	}

	if right < n {
		state.Comparisons++
		if state.Mode == Visualization {
			state.PushEvent(Comparison, "compare", []int{right, largest}, []int{data[right], data[largest]}, "Comparing with largest", 5)
		}
		if data[right] > data[largest] {
			largest = right
		}
	}

	if largest != i {
		state.Swap(data, i, largest, 7)
		heapify(state, data, n, largest)
	}
}

func heapSort(state *SortingState, data []int) {
	n := len(data)

	for i := n/2 - 1; i >= 0; i-- {
		heapify(state, data, n, i)
	}

	for i := n - 1; i > 0; i-- {
		state.Swap(data, 0, i, 16)
		heapify(state, data, i, 0)
	}
}

// SHELL SORT
func shellSort(state *SortingState, data []int) {
	n := len(data)
	for gap := n / 2; gap > 0; gap /= 2 {
		for i := gap; i < n; i++ {
			temp := data[i]
			j := i
			for j >= gap {
				state.Comparisons++
				if state.Mode == Visualization {
					state.PushEvent(Comparison, "compare", []int{j - gap, i}, []int{data[j-gap], temp}, "Comparing elements", 7)
				}
				if data[j-gap] > temp {
					state.Mutation(data, j, data[j-gap], "shift", "Shifted element", 8)
					j -= gap
				} else {
					break
				}
			}
			state.Mutation(data, j, temp, "insert", "Inserted element", 11)
		}
	}
}
