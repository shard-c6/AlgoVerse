# AlgoVerse Task List

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

## Phase 3: Persistence & Analytics [x]
- [x] Update `init.sql` with full algorithm registry
- [x] Enable `sqlalchemy` and `psycopg2-binary` in `requirements.txt`
- [ ] Start local PostgreSQL container (via Docker)
- [x] Implement `database.py` (SQLAlchemy setup)
- [x] Implement `models.py` (DB schema mapping)
- [x] Update `main.py` with DB session handling
- [x] Implement result persistence in `/visualize` and `/benchmark`
- [x] Implement `/history` and `/algorithms` API endpoints
- [x] Install `recharts` for data visualization
- [x] Create `HistoryView` component
- [x] Integrate historical charts into the UI
