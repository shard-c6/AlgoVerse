package main

import (
	"time"
)

type SortingState struct {
	Mode        AlgorithmMode
	Events      []AlgorithmEvent
	Comparisons int
	Swaps       int
}

func (s *SortingState) Compare(a, b int, i, j int) bool {
	s.Comparisons++
	if s.Mode == Visualization {
		s.Events = append(s.Events, AlgorithmEvent{
			Timestamp:   time.Now().UnixMilli(),
			Category:    Comparison,
			Event:       "comparison",
			Indices:     []int{i, j},
			Description: fmt.Sprintf("Comparing index %d and %d", i, j),
		})
	}
	return a < b
}

func (s *SortingState) Swap(data []int, i, j int) {
	data[i], data[j] = data[j], data[i]
	s.Swaps++
	if s.Mode == Visualization {
		stateCopy := make([]int, len(data))
		copy(stateCopy, data)
		s.Events = append(s.Events, AlgorithmEvent{
			Timestamp:   time.Now().UnixMilli(),
			Category:    ArrayMutation,
			Event:       "swap",
			Indices:     []int{i, j},
			Values:      []int{data[i], data[j]},
			Description: fmt.Sprintf("Swapped index %d and %d", i, j),
			State:       stateCopy,
		})
	}
}

func (s *SortingState) Mutation(data []int, i, val int, eventName, desc string) {
	data[i] = val
	if s.Mode == Visualization {
		stateCopy := make([]int, len(data))
		copy(stateCopy, data)
		s.Events = append(s.Events, AlgorithmEvent{
			Timestamp:   time.Now().UnixMilli(),
			Category:    ArrayMutation,
			Event:       eventName,
			Indices:     []int{i},
			Values:      []int{val},
			Description: desc,
			State:       stateCopy,
		})
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
			if !state.Compare(data[j], data[j+1]) && data[j] != data[j+1] { // data[j] > data[j+1]
				state.Swap(data, j, j+1)
			} else {
				state.Comparisons++ // the first compare call could be misleading, so doing explicit >
			}
		}
	}
}

// Re-doing the explicit ones because state.Compare is for '<'
func bubbleSortFix(state *SortingState, data []int) {
	n := len(data)
	for i := 0; i < n; i++ {
		for j := 0; j < n-i-1; j++ {
			state.Comparisons++
			if data[j] > data[j+1] {
				state.Swap(data, j, j+1)
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
		if data[j] <= pivot {
			i++
			state.Swap(data, i, j)
		}
	}
	state.Swap(data, i+1, high)
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
		if L[i] <= R[j] {
			data[k] = L[i]
			i++
		} else {
			data[k] = R[j]
			j++
		}
		if state.Mode == Visualization {
			stateCopy := make([]int, len(data))
			copy(stateCopy, data)
			state.Events = append(state.Events, AlgorithmEvent{
				Timestamp:   time.Now().UnixMilli(),
				Category:    ArrayMutation,
				State:       stateCopy,
				Event:       "merge",
				Description: "Merged elements",
			})
		}
		k++
	}

	for i < n1 {
		data[k] = L[i]
		if state.Mode == Visualization {
			stateCopy := make([]int, len(data))
			copy(stateCopy, data)
			state.Events = append(state.Events, AlgorithmEvent{
				Timestamp:   time.Now().UnixMilli(),
				Category:    ArrayMutation,
				State:       stateCopy,
				Event:       "merge",
				Description: "Merged elements",
			})
		}
		i++
		k++
	}

	for j < n2 {
		data[k] = R[j]
		if state.Mode == Visualization {
			stateCopy := make([]int, len(data))
			copy(stateCopy, data)
			state.Events = append(state.Events, AlgorithmEvent{
				Timestamp:   time.Now().UnixMilli(),
				Category:    ArrayMutation,
				State:       stateCopy,
				Event:       "merge",
				Description: "Merged elements",
			})
		}
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
			if data[j] > key {
				data[j+1] = data[j]
				j--
				if state.Mode == Visualization {
					stateCopy := make([]int, len(data))
					copy(stateCopy, data)
					state.Events = append(state.Events, AlgorithmEvent{
						Timestamp:   time.Now().UnixMilli(),
						Category:    ArrayMutation,
						State:       stateCopy,
						Event:       "shift",
						Description: "Shifted element",
					})
				}
			} else {
				break
			}
		}
		data[j+1] = key
		if state.Mode == Visualization {
			stateCopy := make([]int, len(data))
			copy(stateCopy, data)
			state.Events = append(state.Events, AlgorithmEvent{
				Timestamp:   time.Now().UnixMilli(),
				Category:    ArrayMutation,
				State:       stateCopy,
				Event:       "insert",
				Description: "Inserted element",
			})
		}
	}
}

// SELECTION SORT
func selectionSort(state *SortingState, data []int) {
	n := len(data)
	for i := 0; i < n; i++ {
		minIdx := i
		for j := i + 1; j < n; j++ {
			state.Comparisons++
			if data[j] < data[minIdx] {
				minIdx = j
			}
		}
		if minIdx != i {
			state.Swap(data, i, minIdx)
		}
	}
}

// HEAP SORT
func heapify(state *SortingState, data []int, n, i int) {
	largest := i
	left := 2*i + 1
	right := 2*i + 2

	state.Comparisons++
	if left < n && data[left] > data[largest] {
		largest = left
	}

	state.Comparisons++
	if right < n && data[right] > data[largest] {
		largest = right
	}

	if largest != i {
		state.Swap(data, i, largest)
		heapify(state, data, n, largest)
	}
}

func heapSort(state *SortingState, data []int) {
	n := len(data)

	for i := n/2 - 1; i >= 0; i-- {
		heapify(state, data, n, i)
	}

	for i := n - 1; i > 0; i-- {
		state.Swap(data, 0, i)
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
				if data[j-gap] > temp {
					data[j] = data[j-gap]
					j -= gap
					if state.Mode == Visualization {
						stateCopy := make([]int, len(data))
						copy(stateCopy, data)
						state.Events = append(state.Events, AlgorithmEvent{
							Timestamp:   time.Now().UnixMilli(),
							Category:    ArrayMutation,
							State:       stateCopy,
							Event:       "shift",
							Description: "Shifted element",
						})
					}
				} else {
					break
				}
			}
			data[j] = temp
			if state.Mode == Visualization {
				stateCopy := make([]int, len(data))
				copy(stateCopy, data)
				state.Events = append(state.Events, AlgorithmEvent{
					Timestamp:   time.Now().UnixMilli(),
					Category:    ArrayMutation,
					State:       stateCopy,
					Event:       "insert",
					Description: "Inserted element",
				})
			}
		}
	}
}
