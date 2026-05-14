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
        
        if algo_name == "bubble_sort"
            runner = BubbleSortRunner()
            result = run_algo(runner, input_data, Contracts.visualization)
            return result
        else
            return HTTP.Response(404, "Algorithm not found")
        end
    catch e
        @error "Error in /visualize" exception=(e, catch_backtrace())
        return HTTP.Response(500, "Internal Server Error: $(e)")
    end
end

@post "/benchmark/{algo_name}" function(req::HTTP.Request, algo_name::String)
    try
        data = JSON3.read(req.body)
        input_data = Vector{Int}(data.input)
        
        if algo_name == "bubble_sort"
            runner = BubbleSortRunner()
            result = run_algo(runner, input_data, Contracts.benchmark)
            return result
        else
            return HTTP.Response(404, "Algorithm not found")
        end
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
