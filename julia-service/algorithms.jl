module Algorithms

# include("contracts.jl")
using ..Contracts
using Dates

export AbstractAlgorithmRunner, BubbleSortRunner, run_algo

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

function add_event!(runner::BubbleSortRunner, category::EventCategory, event::String, idx=nothing, val=nothing)
    push!(runner.events, AlgorithmEvent(
        Int64(floor(datetime2unix(now()) * 1000)),
        category,
        event,
        idx,
        val
    ))
end

function run_algo(runner::BubbleSortRunner, input_data::Vector{Int}, mode::AlgorithmMode)
    arr = copy(input_data)
    n = length(arr)
    start_time = now()
    
    # Reset state
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
        "1.0",
        runner.name,
        "julia",
        mode,
        educational,
        mode == visualization ? runner.events : AlgorithmEvent[],
        AlgorithmMetrics(runner.comparisons, runner.swaps, time_ms),
        runner.complexity
    )
end

end
