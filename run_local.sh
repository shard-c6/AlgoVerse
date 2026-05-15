#!/bin/bash

# Kill background processes on exit
trap 'kill $(jobs -p)' EXIT

echo "Cleaning up existing processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8082 | xargs kill -9 2>/dev/null
lsof -ti:8083 | xargs kill -9 2>/dev/null
lsof -ti:8084 | xargs kill -9 2>/dev/null
lsof -ti:8085 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting Julia Analytics Engine..."
(cd julia-service && julia --project=. main.jl) &

echo "Starting Rust Execution Engine..."
(cd rust-service && cargo run) &

echo "Starting Go Execution Engine..."
(cd go-service && go run .) &

echo "Starting C# Execution Engine..."
(cd csharp-service && dotnet run) &

echo "Starting Java Execution Engine..."
(cd java-service && mvn compile exec:java -Dexec.mainClass="com.algoverse.App") &

echo "Starting C/C++ Execution Engine..."
(cd cpp-service && make && ./cpp-service) &

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
echo "Rust: http://localhost:8081"
echo "Go: http://localhost:8082"
echo "C#: http://localhost:8083"
echo "Java: http://localhost:8084"
echo "C/C++: http://localhost:8085"

# Wait for all background processes
wait
