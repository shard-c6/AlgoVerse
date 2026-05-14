module Contracts

using JSON3
using StructTypes

export AlgorithmMode, visualization, benchmark
export VisualizationLevel, minimal, educational, verbose
export EventCategory, array_mutation, comparison, traversal, recursion, backtracking, graph_action
export AlgorithmEvent, AlgorithmMetrics, AlgorithmComplexity, VersionedAlgorithmContract

@enum AlgorithmMode visualization benchmark
@enum VisualizationLevel minimal educational verbose
@enum EventCategory array_mutation comparison traversal recursion backtracking graph_action

struct AlgorithmEvent
    timestamp::Int64
    category::EventCategory
    event::String
    indices::Union{Nothing, Vector{Int}}
    values::Union{Nothing, Vector{Any}}
    metadata::Union{Nothing, Dict{String, Any}}
end

# Outer constructors for convenience and to avoid recursion
# We use Any for idx and val to allow flexible input, but they'll be converted by the struct constructor or we can convert them here.
function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String, idx, val)
    idx_conv = idx === nothing ? nothing : Vector{Int}(idx)
    val_conv = val === nothing ? nothing : Vector{Any}(val)
    return AlgorithmEvent(ts, cat, ev, idx_conv, val_conv, nothing)
end

function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String, idx)
    idx_conv = idx === nothing ? nothing : Vector{Int}(idx)
    return AlgorithmEvent(ts, cat, ev, idx_conv, nothing, nothing)
end

function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String)
    return AlgorithmEvent(ts, cat, ev, nothing, nothing, nothing)
end

struct AlgorithmMetrics
    comparisons::Int64
    swaps::Int64
    time_ms::Float64
    allocations::Int64
    memory_used_kb::Union{Nothing, Float64}
end

AlgorithmMetrics(comp, sw, time) = AlgorithmMetrics(comp, sw, time, 0, nothing)

struct AlgorithmComplexity
    time::String
    space::String
end

struct VersionedAlgorithmContract
    version::String
    algorithm::String
    language::String
    mode::AlgorithmMode
    visualization_level::VisualizationLevel
    events::Vector{AlgorithmEvent}
    metrics::AlgorithmMetrics
    complexity::AlgorithmComplexity
    final_state::Union{Nothing, Vector{Int}}
end

# StructTypes for JSON serialization
StructTypes.StructType(::Type{AlgorithmEvent}) = StructTypes.Struct()
StructTypes.StructType(::Type{AlgorithmMetrics}) = StructTypes.Struct()
StructTypes.StructType(::Type{AlgorithmComplexity}) = StructTypes.Struct()
StructTypes.StructType(::Type{VersionedAlgorithmContract}) = StructTypes.Struct()

# JSON3 Custom Enum handling
StructTypes.StructType(::Type{AlgorithmMode}) = StructTypes.StringType()
StructTypes.StructType(::Type{VisualizationLevel}) = StructTypes.StringType()
StructTypes.StructType(::Type{EventCategory}) = StructTypes.StringType()

end
