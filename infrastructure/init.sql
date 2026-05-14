-- Initialization script for AlgoVerse PostgreSQL Database

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE algorithms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'sorting', 'graphs'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE benchmark_runs (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER REFERENCES algorithms(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    input_size INTEGER NOT NULL,
    execution_time_ms DOUBLE PRECISION NOT NULL,
    comparisons INTEGER,
    swaps INTEGER,
    allocations INTEGER,
    memory_used_kb DOUBLE PRECISION,
    metrics_json JSONB NOT NULL,
    run_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visualization_sessions (
    id SERIAL PRIMARY KEY,
    algorithm_id INTEGER REFERENCES algorithms(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    input_size INTEGER NOT NULL,
    events_json JSONB NOT NULL, -- The stored deterministic replay events
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial sorting algorithms metadata
INSERT INTO algorithms (name, category, description) VALUES
('quicksort', 'sorting', 'A highly efficient sorting algorithm based on partitioning of array of data into smaller arrays.'),
('bubblesort', 'sorting', 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.');
