from fastapi import FastAPI, Body, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contracts.models import AlgorithmMode
from algorithms.sorting import BubbleSortRunner, QuickSortRunner, MergeSortRunner, InsertionSortRunner
from typing import List, Optional
import httpx
import os
from sqlalchemy.orm import Session
from database import get_db, engine
import models

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlgoVerse Orchestrator")

JULIA_SERVICE_URL = os.getenv("JULIA_SERVICE_URL", "http://localhost:8080")

# Internal mapping of slug to Runner class
ALGORITHM_RUNNERS = {
    "bubblesort": BubbleSortRunner,
    "quicksort": QuickSortRunner,
    "mergesort": MergeSortRunner,
    "insertionsort": InsertionSortRunner
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
            # Handle both Python (ns) and potential Julia variations
            time_ns = metrics.get("execution_time_ns", 0)
            
            run = models.BenchmarkRun(
                algorithm_id=algo.id,
                language=language,
                input_size=input_size,
                execution_time_ms=time_ns / 1_000_000.0,
                comparisons=metrics.get("comparisons"),
                swaps=metrics.get("swaps"),
                allocations=metrics.get("allocations"),
                memory_used_kb=metrics.get("memory_allocated_bytes", 0) / 1024.0,
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

@app.post("/visualize/{algo_name}")
async def visualize(
    algo_name: str, 
    language: str = Query("python"), 
    input_data: List[int] = Body(embed=True),
    db: Session = Depends(get_db)
):
    result = None
    if language == "julia":
        async with httpx.AsyncClient() as client:
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
        async with httpx.AsyncClient() as client:
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
