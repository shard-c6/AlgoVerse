from fastapi import FastAPI, Body, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contracts.models import AlgorithmMode
from algorithms.sorting import BubbleSortRunner, QuickSortRunner, MergeSortRunner, InsertionSortRunner, SelectionSortRunner, HeapSortRunner, ShellSortRunner
from typing import List, Optional
import httpx
import os
import math
from sqlalchemy.orm import Session
from database import get_db, engine
import models

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

COMPLEXITY_MODELS = {
    "bubble_sort": "O(n^2)",
    "quick_sort": "O(n log n)",
    "merge_sort": "O(n log n)",
    "insertion_sort": "O(n^2)",
    "selection_sort": "O(n^2)",
    "heap_sort": "O(n log n)",
    "shell_sort": "O(n log n)"
}

def seed_db():
    db = next(get_db())
    if db.query(models.Algorithm).count() == 0:
        print("Seeding database with default algorithms...")
        for name, complexity in COMPLEXITY_MODELS.items():
            algo = models.Algorithm(
                name=name, 
                category="sorting", 
                description=f"Standard {name.replace('_', ' ')} implementation",
                complexity_class=complexity
            )
            db.add(algo)
        db.commit()
    db.close()

seed_db()

app = FastAPI(title="AlgoVerse Orchestrator")

JULIA_SERVICE_URL = os.getenv("JULIA_SERVICE_URL", "http://localhost:8080")

# Internal mapping of slug to Runner class
ALGORITHM_RUNNERS = {
    "bubble_sort": BubbleSortRunner,
    "quick_sort": QuickSortRunner,
    "merge_sort": MergeSortRunner,
    "insertion_sort": InsertionSortRunner,
    "selection_sort": SelectionSortRunner,
    "heap_sort": HeapSortRunner,
    "shell_sort": ShellSortRunner
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def persist_result(db: Session, algo_name: str, language: str, mode: str, input_size: int, result: dict):
    try:
        algo = db.query(models.Algorithm).filter(models.Algorithm.name == algo_name).first()
        if not algo:
            # Auto-seed if missing
            algo = models.Algorithm(name=algo_name, category="sorting", description="Auto-registered algorithm")
            db.add(algo)
            db.commit()
            db.refresh(algo)
        
        if mode == "benchmark":
            metrics = result.get("metrics", {})
            # Handle both Python (ms or ns) and potential Julia variations
            # Julia returns 'time_ms' directly in the contract
            # Python runners also return 'time_ms' in create_contract
            time_ms = metrics.get("time_ms")
            if time_ms is None:
                time_ns = metrics.get("execution_time_ns", 0)
                time_ms = time_ns / 1_000_000.0
            
            run = models.BenchmarkRun(
                algorithm_id=algo.id,
                language=language,
                input_size=input_size,
                execution_time_ms=time_ms,
                comparisons=metrics.get("comparisons"),
                swaps=metrics.get("swaps"),
                allocations=metrics.get("allocations"),
                memory_used_kb=metrics.get("memory_allocated_bytes", 0) / 1024.0 if metrics.get("memory_allocated_bytes") else metrics.get("memory_used_kb", 0),
                metrics_json=metrics
            )
            db.add(run)
        else:
            session = models.VisualizationSession(
                algorithm_id=algo.id,
                language=language,
                input_size=input_size,
                events_json=result.get("events", [])
            )
            db.add(session)
        
        db.commit()
    except Exception as e:
        print(f"Persistence error: {e}")
        db.rollback()

@app.get("/")
async def root():
    return {"message": "Welcome to AlgoVerse Orchestrator API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/algorithms")
async def list_algorithms(db: Session = Depends(get_db)):
    return db.query(models.Algorithm).all()

@app.get("/history/{algo_name}")
async def get_history(algo_name: str, db: Session = Depends(get_db)):
    algo = db.query(models.Algorithm).filter(models.Algorithm.name == algo_name).first()
    if not algo:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    runs = db.query(models.BenchmarkRun)\
             .filter(models.BenchmarkRun.algorithm_id == algo.id)\
             .order_by(models.BenchmarkRun.run_date.desc())\
             .limit(50)\
             .all()
    return runs

@app.get("/complexity/{algo_name}")
async def get_complexity_data(algo_name: str, db: Session = Depends(get_db)):
    algo = db.query(models.Algorithm).filter(models.Algorithm.name == algo_name).first()
    if not algo:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    # Get historical actuals
    actual_runs = db.query(models.BenchmarkRun)\
                   .filter(models.BenchmarkRun.algorithm_id == algo.id)\
                   .order_by(models.BenchmarkRun.input_size.asc())\
                   .all()
    
    # Generate theoretical points based on complexity class
    input_sizes = sorted(list(set([run.input_size for run in actual_runs])))
    if not input_sizes:
        input_sizes = [10, 50, 100, 500, 1000] # Default range
        
    theoretical_points = []
    for n in input_sizes:
        val = 0
        if algo.complexity_class == "O(n^2)":
            val = n * n
        elif algo.complexity_class == "O(n log n)":
            val = n * math.log2(n) if n > 0 else 0
        else:
            val = n
        theoretical_points.append({"n": n, "theoretical_value": val})
        
    return {
        "algorithm": algo.name,
        "complexity": algo.complexity_class,
        "actual_runs": actual_runs,
        "theoretical_points": theoretical_points
    }

@app.post("/visualize/{algo_name}")
async def visualize(
    algo_name: str, 
    language: str = Query("python"), 
    input_data: List[int] = Body(embed=True),
    db: Session = Depends(get_db)
):
    result = None
    if language == "julia":
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{JULIA_SERVICE_URL}/visualize/{algo_name}", json={"input": input_data})
            result = response.json()
    else:
        if algo_name not in ALGORITHM_RUNNERS:
            raise HTTPException(status_code=404, detail="Algorithm not found")
        runner = ALGORITHM_RUNNERS[algo_name]()
        result = runner.run(input_data, mode=AlgorithmMode.VISUALIZATION)
    
    if result and "error" not in result:
        persist_result(db, algo_name, language, "visualize", len(input_data), result)
    
    return result

@app.post("/benchmark/{algo_name}")
async def benchmark(
    algo_name: str, 
    language: str = Query("python"), 
    input_data: List[int] = Body(embed=True),
    db: Session = Depends(get_db)
):
    result = None
    if language == "julia":
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{JULIA_SERVICE_URL}/benchmark/{algo_name}", json={"input": input_data})
            result = response.json()
    else:
        if algo_name not in ALGORITHM_RUNNERS:
            raise HTTPException(status_code=404, detail="Algorithm not found")
        runner = ALGORITHM_RUNNERS[algo_name]()
        result = runner.run(input_data, mode=AlgorithmMode.BENCHMARK)
    
    if result and "error" not in result:
        persist_result(db, algo_name, language, "benchmark", len(input_data), result)
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
