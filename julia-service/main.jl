module AlgoVerseService

using Oxygen
using HTTP
using JSON3
using BenchmarkTools

include("contracts.jl")
include("algorithms.jl")

using .Contracts
using .Algorithms

@post "/visualize/{algo_name}" function(req::HTTP.Request, algo_name::String)
    try
        data = JSON3.read(req.body)
        input_data = Vector{Int}(data.input)
        
        runner = if algo_name == "bubble_sort"
            BubbleSortRunner()
        elseif algo_name == "quick_sort"
            QuickSortRunner()
        elseif algo_name == "merge_sort"
            MergeSortRunner()
        elseif algo_name == "insertion_sort"
            InsertionSortRunner()
        elseif algo_name == "selection_sort"
            SelectionSortRunner()
        elseif algo_name == "heap_sort"
            HeapSortRunner()
        elseif algo_name == "shell_sort"
            ShellSortRunner()
        else
            return HTTP.Response(404, "Algorithm not found")
        end
        
        result = run_algo(runner, input_data, Contracts.visualization)
        return result
    catch e
        @error "Error in /visualize" exception=(e, catch_backtrace())
        return HTTP.Response(500, "Internal Server Error: $(e)")
    end
end

@post "/benchmark/{algo_name}" function(req::HTTP.Request, algo_name::String)
    try
        data = JSON3.read(req.body)
        input_data = Vector{Int}(data.input)
        
        # Map algorithm names to runner types
        runners = Dict(
            "bubble_sort" => BubbleSortRunner,
            "quick_sort" => QuickSortRunner,
            "merge_sort" => MergeSortRunner,
            "insertion_sort" => InsertionSortRunner,
            "selection_sort" => SelectionSortRunner,
            "heap_sort" => HeapSortRunner,
            "shell_sort" => ShellSortRunner
        )
        
        if !haskey(runners, algo_name)
            return HTTP.Response(404, "Algorithm not found")
        end
        
        runner_type = runners[algo_name]
        
        # Use @belapsed for high-precision timing in benchmark mode
        # We recreate the runner in each trial to ensure a fresh state if necessary (though run_algo resets it)
        # However, @belapsed setup block is best for this.
        t_elapsed = @belapsed run_algo(r, input, Contracts.benchmark) setup=(r=$runner_type(); input=copy($input_data))
        
        # Run one final time to get metrics and final state
        result = run_algo(runner_type(), input_data, Contracts.benchmark)
        
        # Update the result with high-precision time (converted to ms)
        new_metrics = AlgorithmMetrics(result.metrics.comparisons, result.metrics.swaps, t_elapsed * 1000)
        
        # Return updated contract
        return VersionedAlgorithmContract(
            result.version, result.algorithm, result.language, result.mode,
            result.visualization_level, result.events, new_metrics, result.complexity, result.final_state
        )
    catch e
        @error "Error in /benchmark" exception=(e, catch_backtrace())
        return HTTP.Response(500, "Internal Server Error: $(e)")
    end
end

@get "/health" function()
    return Dict("status" => "healthy", "engine" => "julia")
end

function start()
    println("Julia Analytics Engine starting on port 8080...")
    serve(port=8080)
end

end # module AlgoVerseService

using .AlgoVerseService
AlgoVerseService.start()
