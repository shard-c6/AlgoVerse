from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from contracts.models import AlgorithmMode
from algorithms.sorting import BubbleSortRunner
from typing import List, Optional
import httpx
import os

app = FastAPI(title="AlgoVerse Orchestrator")

JULIA_SERVICE_URL = os.getenv("JULIA_SERVICE_URL", "http://localhost:8080")

# In-memory registry for now
ALGORITHMS = {
    "bubble_sort": BubbleSortRunner
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to AlgoVerse Orchestrator API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/visualize/{algo_name}")
async def visualize(algo_name: str, language: str = Query("python"), input_data: List[int] = Body(embed=True)):
    if language == "julia":
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{JULIA_SERVICE_URL}/visualize/{algo_name}", json={"input": input_data})
            return response.json()
    
    if algo_name not in ALGORITHMS:
        return {"error": "Algorithm not found"}
    
    runner = ALGORITHMS[algo_name]()
    result = runner.run(input_data, mode=AlgorithmMode.VISUALIZATION)
    return result

@app.post("/benchmark/{algo_name}")
async def benchmark(algo_name: str, language: str = Query("python"), input_data: List[int] = Body(embed=True)):
    if language == "julia":
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{JULIA_SERVICE_URL}/benchmark/{algo_name}", json={"input": input_data})
            return response.json()

    if algo_name not in ALGORITHMS:
        return {"error": "Algorithm not found"}
    
    runner = ALGORITHMS[algo_name]()
    result = runner.run(input_data, mode=AlgorithmMode.BENCHMARK)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
