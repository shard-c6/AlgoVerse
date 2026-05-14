# AlgoVerse: PackageCompiler Precompile Script
# This script exercises the core functionality to ensure JIT warmup is captured.

using Oxygen
using JSON3
using HTTP

# Include core logic
include("contracts.jl")
include("algorithms.jl")

# 1. Test Contract Serialization
event = AlgorithmEvent(type=COMPARE, indices=[0, 1], metadata=Dict("test" => "data"))
JSON3.write(event)

# 2. Exercise Algorithm Engine
data = [5, 3, 8, 1]
# We don't need to run the full server, just the functions the server calls
result = AlgoVerseService.run_algo("bubble_sort", data)
benchmark = AlgoVerseService.run_benchmark("bubble_sort", data)

println("Precompile exercise complete.")
