module Algorithms

# include("contracts.jl")
using ..Contracts
using Dates

export AbstractAlgorithmRunner, BubbleSortRunner, QuickSortRunner, MergeSortRunner, InsertionSortRunner, 
       SelectionSortRunner, HeapSortRunner, ShellSortRunner, run_algo

abstract type AbstractAlgorithmRunner end

# --- Shared Utilities ---

function add_event!(runner::AbstractAlgorithmRunner, category::EventCategory, event::String, line_number::Int, idx=nothing, val=nothing, desc=nothing)
    push!(runner.events, AlgorithmEvent(
        Int64(floor(datetime2unix(now()) * 1000)),
        category,
        event,
        idx,
        val,
        desc,
        EventMetadata(line_number)
    ))
end

# --- Bubble Sort Runner ---

mutable struct BubbleSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    BubbleSortRunner() = new(
        "bubblesort", 
        AlgorithmComplexity("O(n^2)", "O(1)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::BubbleSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 1, nothing, copy(arr), "Initial state")
    end

    for i in 1:n
        for j in 1:(n - i)
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare", 5, [j-1, j], [arr[j], arr[j+1]], "Comparing $(arr[j]) and $(arr[j+1])")
            end
            
            if arr[j] > arr[j+1]
                arr[j], arr[j+1] = arr[j+1], arr[j]
                runner.swaps += 1
                if mode == visualization
                    add_event!(runner, array_mutation, "swap", 6, [j-1, j], [arr[j], arr[j+1]], "Swapping $(arr[j]) and $(arr[j+1])")
                end
            end
        end
    end

    if mode == visualization
        add_event!(runner, final, "final", 10, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

# --- Quick Sort Runner ---

mutable struct QuickSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    QuickSortRunner() = new(
        "quicksort", 
        AlgorithmComplexity("O(n log n)", "O(log n)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::QuickSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 14, nothing, copy(arr), "Initial state")
    end

    function partition!(low, high)
        pivot = arr[high]
        if mode == visualization
            add_event!(runner, comparison, "pivot", 2, [high-1], [pivot], "Chosen pivot $pivot")
        end
        i = low - 1
        for j in low:high-1
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare pivot", 5, [j-1, high-1], [arr[j], pivot], "Comparing $(arr[j]) with pivot $pivot")
            end
            
            if arr[j] <= pivot
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                runner.swaps += 1
                if mode == visualization
                    add_event!(runner, array_mutation, "swap", 7, [i-1, j-1], [arr[i], arr[j]], "Swapping $(arr[i]) and $(arr[j])")
                end
            end
        end
        arr[i+1], arr[high] = arr[high], arr[i+1]
        runner.swaps += 1
        if mode == visualization
            add_event!(runner, array_mutation, "swap pivot", 10, [i, high-1], [arr[i+1], arr[high]], "Placing pivot at correct position")
        end
        return i + 1
    end

    function quick_sort!(low, high)
        if low < high
            pi = partition!(low, high)
            quick_sort!(low, pi - 1)
            quick_sort!(pi + 1, high)
        end
    end

    quick_sort!(1, length(arr))

    if mode == visualization
        add_event!(runner, final, "final", 20, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

# --- Merge Sort Runner ---

mutable struct MergeSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    MergeSortRunner() = new(
        "mergesort", 
        AlgorithmComplexity("O(n log n)", "O(n)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::MergeSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 29, nothing, copy(arr), "Initial state")
    end

    function merge!(l, m, r)
        left_arr = arr[l:m]
        right_arr = arr[m+1:r]
        i = 1
        j = 1
        k = l
        
        while i <= length(left_arr) && j <= length(right_arr)
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare", 8, [l+i-2, m+j-1], [left_arr[i], right_arr[j]], "Comparing elements from left and right sub-arrays")
            end
            
            if left_arr[i] <= right_arr[j]
                arr[k] = left_arr[i]
                i += 1
                if mode == visualization
                    add_event!(runner, array_mutation, "overwrite", 9, [k-1], [arr[k]], "Merging value $(arr[k]) back to array")
                end
            else
                arr[k] = right_arr[j]
                j += 1
                if mode == visualization
                    add_event!(runner, array_mutation, "overwrite", 12, [k-1], [arr[k]], "Merging value $(arr[k]) back to array")
                end
            end
            k += 1
        end

        while i <= length(left_arr)
            arr[k] = left_arr[i]
            if mode == visualization
                add_event!(runner, array_mutation, "overwrite", 18, [k-1], [arr[k]], "Merging remaining left elements")
            end
            i += 1
            k += 1
        end

        while j <= length(right_arr)
            arr[k] = right_arr[j]
            if mode == visualization
                add_event!(runner, array_mutation, "overwrite", 23, [k-1], [arr[k]], "Merging remaining right elements")
            end
            j += 1
            k += 1
        end
    end

    function merge_sort!(l, r)
        if l < r
            m = floor(Int, (l + r) / 2)
            merge_sort!(l, m)
            merge_sort!(m + 1, r)
            merge!(l, m, r)
        end
    end

    merge_sort!(1, length(arr))

    if mode == visualization
        add_event!(runner, final, "final", 38, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

# --- Insertion Sort Runner ---

mutable struct InsertionSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    InsertionSortRunner() = new(
        "insertionsort", 
        AlgorithmComplexity("O(n^2)", "O(1)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::InsertionSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 1, nothing, copy(arr), "Initial state")
    end

    for i in 2:n
        key = arr[i]
        if mode == visualization
            add_event!(runner, comparison, "pick", 3, [i-1], [key], "Picking element $key")
        end
        j = i - 1
        while j >= 1
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare", 5, [j-1, i-1], [arr[j], key], "Comparing $(arr[j]) with key $key")
            end
            
            if arr[j] > key
                arr[j+1] = arr[j]
                if mode == visualization
                    add_event!(runner, array_mutation, "shift", 6, [j], [arr[j+1]], "Shifting element forward")
                end
                j -= 1
            else
                break
            end
        end
        arr[j+1] = key
        if mode == visualization
            add_event!(runner, array_mutation, "insert", 9, [j], [arr[j+1]], "Inserting key at correct position")
        end
    end

    if mode == visualization
        add_event!(runner, final, "final", 11, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

# --- Selection Sort Runner ---

mutable struct SelectionSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    SelectionSortRunner() = new(
        "selectionsort", 
        AlgorithmComplexity("O(n^2)", "O(1)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::SelectionSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 1, nothing, copy(arr), "Initial state")
    end

    for i in 1:n
        min_idx = i
        for j in (i+1):n
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare to min", 6, [j-1, min_idx-1], [arr[j], arr[min_idx]], "Comparing $(arr[j]) with current min $(arr[min_idx])")
            end
            if arr[j] < arr[min_idx]
                min_idx = j
            end
        end
        if min_idx != i
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            runner.swaps += 1
            if mode == visualization
                add_event!(runner, array_mutation, "swap min", 11, [i-1, min_idx-1], [arr[i], arr[min_idx]], "Swapping element at $i with minimum at $min_idx")
            end
        end
    end

    if mode == visualization
        add_event!(runner, final, "final", 14, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

# --- Heap Sort Runner ---

mutable struct HeapSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    HeapSortRunner() = new(
        "heapsort", 
        AlgorithmComplexity("O(n log n)", "O(1)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::HeapSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 20, nothing, copy(arr), "Initial state")
    end

    function heapify!(n, i)
        largest = i
        l = 2 * i
        r = 2 * i + 1

        if l <= n
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare left", 6, [l-1, largest-1], [arr[l], arr[largest]], "Comparing left child $(arr[l]) with parent $(arr[largest])")
            end
            if arr[l] > arr[largest]
                largest = l
            end
        end

        if r <= n
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare right", 10, [r-1, largest-1], [arr[r], arr[largest]], "Comparing right child $(arr[r]) with parent $(arr[largest])")
            end
            if arr[r] > arr[largest]
                largest = r
            end
        end

        if largest != i
            arr[i], arr[largest] = arr[largest], arr[i]
            runner.swaps += 1
            if mode == visualization
                add_event!(runner, array_mutation, "swap in heap", 15, [i-1, largest-1], [arr[i], arr[largest]], "Swapping parent with larger child")
            end
            heapify!(n, largest)
        end
    end

    # Build heap
    for i in floor(Int, n/2):-1:1
        heapify!(n, i)
    end

    # Extract elements
    for i in n:-1:2
        arr[i], arr[1] = arr[1], arr[i]
        runner.swaps += 1
        if mode == visualization
            add_event!(runner, array_mutation, "move root to end", 27, [0, i-1], [arr[1], arr[i]], "Moving heap root $(arr[1]) to position $(i-1)")
        end
        heapify!(i-1, 1)
    end

    if mode == visualization
        add_event!(runner, final, "final", 30, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

# --- Shell Sort Runner ---

mutable struct ShellSortRunner <: AbstractAlgorithmRunner
    name::String
    complexity::AlgorithmComplexity
    events::Vector{AlgorithmEvent}
    comparisons::Int64
    swaps::Int64
    
    ShellSortRunner() = new(
        "shellsort", 
        AlgorithmComplexity("O(n log n)", "O(1)"),
        AlgorithmEvent[],
        0,
        0
    )
end

function run_algo(runner::ShellSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    if mode == visualization
        add_event!(runner, initial, "initial", 1, nothing, copy(arr), "Initial state")
    end

    gap = floor(Int, n/2)
    while gap > 0
        for i in (gap+1):n
            temp = arr[i]
            j = i
            while j > gap
                runner.comparisons += 1
                if mode == visualization
                    add_event!(runner, comparison, "compare in gap", 9, [j-gap-1, j-1], [arr[j-gap], temp], "Comparing elements with gap $gap")
                end
                
                if arr[j - gap] > temp
                    arr[j] = arr[j - gap]
                    if mode == visualization
                        add_event!(runner, array_mutation, "shift by gap", 10, [j-1], [arr[j]], "Shifting element forward by gap")
                    end
                    j -= gap
                else
                    break
                end
            end
            arr[j] = temp
            if mode == visualization
                add_event!(runner, array_mutation, "insert in gap", 13, [j-1], [arr[j]], "Inserting element at gap position")
            end
        end
        gap = floor(Int, gap/2)
    end

    if mode == visualization
        add_event!(runner, final, "final", 17, nothing, copy(arr), "Sorted state")
    end

    end_time = now()
    time_ms = float(Dates.value(end_time - start_time))
    
    return VersionedAlgorithmContract(
        "1.0", runner.name, "julia", mode, educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity, arr
    )
end

end

