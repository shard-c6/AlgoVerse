# AlgoVerse Task List

## Maintenance & Stability [x]
- [x] Resolve Vite `SyntaxError` (BenchmarkRun export conflict)
- [x] Standardize type imports across Frontend components
- [x] Verify Rust/Go availability for Phase 5


## Phase 2: Scaling Algorithm Engine [x]
- [x] Implement QuickSort in Python
- [x] Implement MergeSort in Python
- [x] Implement InsertionSort in Python
- [x] Implement QuickSort in Julia
- [x] Implement MergeSort in Julia
- [x] Implement InsertionSort in Julia
- [x] Standardize visualization events across all new algorithms
- [x] Update cross-service contract to include `final_state`
- [x] Update Python Orchestrator registry
- [x] Update Julia Oxygen.jl routes
- [x] Update Frontend to support algorithm selection
- [x] Verified all algorithms via API and UI integration
- [x] Implement HeapSort in Python
- [x] Implement ShellSort in Python
- [x] Implement SelectionSort in Python
- [x] Implement HeapSort in Julia
- [x] Implement ShellSort in Julia
- [x] Implement SelectionSort in Julia
- [x] Update registries and contracts for new algorithms

## Phase 3: Persistence & Analytics [x]
- [x] Update `init.sql` with full algorithm registry
- [x] Enable `sqlalchemy` and `psycopg2-binary` in `requirements.txt`
- [x] Implement `database.py` (SQLAlchemy setup) - *Fallback to SQLite implemented*
- [x] Implement `models.py` (DB schema mapping)
- [x] Update `main.py` with DB session handling
- [x] Implement result persistence in `/visualize` and `/benchmark`
- [x] Implement `/history` and `/algorithms` API endpoints
- [x] Install `recharts` for data visualization
- [x] Create `HistoryView` component
- [x] Integrate historical charts into the UI

## Phase 4: Asymptotic Complexity Dashboard [x]
- [x] Implement theoretical complexity models in Backend
- [x] Create `/complexity` endpoint for trend analysis
- [x] Setup D3.js in Frontend
- [x] Build `ComplexityDashboard` component with multi-series line charts
- [x] Add logarithmic scale support and constant factor calibration
- [x] Integrate complexity insights into the main UI
- [x] Fixed Julia metrics persistence (time_ms vs execution_time_ns mapping)

## Phase 5: Rust Execution Engine & Polyglot Expansion [x]
- [x] Scaffold `rust-service` with `Cargo.toml` and `axum`
- [x] Implement Versioned Contract types in Rust
- [x] Port sorting algorithms to Rust (Bubble, Quick, Merge, etc.)
- [x] Integrate Rust service into Backend Orchestrator
- [x] Add Rust support to Frontend UI and Complexity Dashboard
- [x] Verify Rust performance metrics persistence
- [x] Standardized Rust events with Initial/Final states and descriptions

## Phase 6: Code Snippet Viewer [x]
- [x] Install `react-syntax-highlighter` dependency
- [x] Create Code Snippet data source (`snippets.ts`) for Python, Julia, Rust
- [x] Implement `CodeViewer` component
- [x] Integrate "Code" tab in `App.tsx` navigation
- [x] Verify active view state mapping

## Phase 7: Polyglot Expansion (Go, C, C++, C#, Java) [x]
- [x] Implement Go Execution Engine (`go-service`)
- [x] Implement C# Execution Engine (`csharp-service`)
- [x] Implement Java Execution Engine (`java-service`)
- [x] Implement C/C++ Execution Engine (`cpp-service`)
- [x] Standardize Java events with Initial/Final states and descriptions
- [x] Standardize Julia events with Initial/Final states and descriptions
- [x] Update Frontend SortingVisualizer to support unified data contract
- [x] Update Python Orchestrator (`main.py`) to route to new services
- [x] Expand frontend Code Snippet Viewer to support new languages
- [x] Update frontend dashboard with buttons for new languages
- [x] Update `run_local.sh` to launch new services
- [x] Test and verify all pipelines
