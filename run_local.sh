#!/bin/bash

# Kill background processes on exit
trap 'kill $(jobs -p)' EXIT

echo "Cleaning up existing processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting Julia Analytics Engine..."
(cd julia-service && julia --project=. main.jl) &

echo "Starting FastAPI Orchestrator..."
(cd backend && python3 main.py) &

echo "Starting Frontend Dev Server..."
(cd frontend && npm run dev) &

echo "Waiting for services to initialize..."
sleep 5

echo "All services started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "Julia: http://localhost:8080"

# Wait for all background processes
wait
