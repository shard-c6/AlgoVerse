module Algorithms

# include("contracts.jl")
using ..Contracts
using Dates

export AbstractAlgorithmRunner, BubbleSortRunner, QuickSortRunner, MergeSortRunner, InsertionSortRunner, run_algo

abstract type AbstractAlgorithmRunner end

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

# --- Shared Utilities ---

function add_event!(runner::AbstractAlgorithmRunner, category::EventCategory, event::String, idx=nothing, val=nothing)
    push!(runner.events, AlgorithmEvent(
        Int64(floor(datetime2unix(now()) * 1000)),
        category,
        event,
        idx,
        val
    ))
end

# --- Bubble Sort Runner ---

function run_algo(runner::BubbleSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    runner.events = AlgorithmEvent[]
    runner.comparisons = 0
    runner.swaps = 0

    for i in 1:n
        for j in 1:(n - i)
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare", [j-1, j], [arr[j], arr[j+1]])
            end
            
            if arr[j] > arr[j+1]
                arr[j], arr[j+1] = arr[j+1], arr[j]
                runner.swaps += 1
                if mode == visualization
                    add_event!(runner, array_mutation, "swap", [j-1, j], [arr[j], arr[j+1]])
                end
            end
        end
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

    function partition!(low, high)
        pivot = arr[high]
        i = low - 1
        for j in low:high-1
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare pivot", [j-1, high-1], [arr[j], pivot])
            end
            
            if arr[j] <= pivot
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                runner.swaps += 1
                if mode == visualization
                    add_event!(runner, array_mutation, "swap", [i-1, j-1], [arr[i], arr[j]])
                end
            end
        end
        arr[i+1], arr[high] = arr[high], arr[i+1]
        runner.swaps += 1
        if mode == visualization
            add_event!(runner, array_mutation, "swap pivot", [i, high-1], [arr[i+1], arr[high]])
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

    function merge!(l, m, r)
        left_arr = arr[l:m]
        right_arr = arr[m+1:r]
        i = 1
        j = 1
        k = l
        
        while i <= length(left_arr) && j <= length(right_arr)
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare", [l+i-2, m+j-1], [left_arr[i], right_arr[j]])
            end
            
            if left_arr[i] <= right_arr[j]
                arr[k] = left_arr[i]
                i += 1
            else
                arr[k] = right_arr[j]
                j += 1
            end
            
            if mode == visualization
                add_event!(runner, array_mutation, "overwrite", [k-1], [arr[k]])
            end
            k += 1
        end

        while i <= length(left_arr)
            arr[k] = left_arr[i]
            if mode == visualization
                add_event!(runner, array_mutation, "overwrite", [k-1], [arr[k]])
            end
            i += 1
            k += 1
        end

        while j <= length(right_arr)
            arr[k] = right_arr[j]
            if mode == visualization
                add_event!(runner, array_mutation, "overwrite", [k-1], [arr[k]])
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

    for i in 2:n
        key = arr[i]
        j = i - 1
        while j >= 1
            runner.comparisons += 1
            if mode == visualization
                add_event!(runner, comparison, "compare", [j-1, j], [arr[j], key])
            end
            
            if arr[j] > key
                arr[j+1] = arr[j]
                if mode == visualization
                    add_event!(runner, array_mutation, "shift", [j], [arr[j+1]])
                end
                j -= 1
            else
                break
            end
        end
        arr[j+1] = key
        if mode == visualization
            add_event!(runner, array_mutation, "insert", [j], [arr[j+1]])
        end
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
