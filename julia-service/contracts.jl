module Contracts

using JSON3
using StructTypes

export AlgorithmMode, visualization, benchmark
export VisualizationLevel, minimal, educational, verbose
export EventCategory, initial, final, array_mutation, comparison, traversal, recursion, backtracking, graph_action
export AlgorithmEvent, AlgorithmMetrics, AlgorithmComplexity, VersionedAlgorithmContract

@enum AlgorithmMode visualization benchmark
@enum VisualizationLevel minimal educational verbose
@enum EventCategory initial final array_mutation comparison traversal recursion backtracking graph_action

struct EventMetadata
    line_number::Int
end

struct AlgorithmEvent
    timestamp::Int64
    category::EventCategory
    event::String
    indices::Union{Nothing, Vector{Int}}
    values::Union{Nothing, Vector{Int}}
    description::Union{Nothing, String}
    metadata::Union{Nothing, EventMetadata}
end

# Outer constructors for convenience
function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String, idx, val, desc, metadata=nothing)
    idx_conv = idx === nothing ? nothing : Vector{Int}(idx)
    val_conv = val === nothing ? nothing : Vector{Int}(val)
    return AlgorithmEvent(ts, cat, ev, idx_conv, val_conv, desc, metadata)
end

function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String, idx, val, metadata=nothing)
    return AlgorithmEvent(ts, cat, ev, idx, val, nothing, metadata)
end

function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String, idx, metadata=nothing)
    return AlgorithmEvent(ts, cat, ev, idx, nothing, nothing, metadata)
end

function AlgorithmEvent(ts::Int64, cat::EventCategory, ev::String, metadata=nothing)
    return AlgorithmEvent(ts, cat, ev, nothing, nothing, nothing, metadata)
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
StructTypes.StructType(::Type{EventMetadata}) = StructTypes.Struct()
StructTypes.StructType(::Type{AlgorithmEvent}) = StructTypes.Struct()
StructTypes.StructType(::Type{AlgorithmMetrics}) = StructTypes.Struct()
StructTypes.StructType(::Type{AlgorithmComplexity}) = StructTypes.Struct()
StructTypes.StructType(::Type{VersionedAlgorithmContract}) = StructTypes.Struct()

# JSON3 Custom Enum handling
StructTypes.StructType(::Type{AlgorithmMode}) = StructTypes.StringType()
StructTypes.StructType(::Type{VisualizationLevel}) = StructTypes.StringType()
StructTypes.StructType(::Type{EventCategory}) = StructTypes.StringType()

end
