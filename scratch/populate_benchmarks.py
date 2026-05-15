import requests
import random
import time

API_BASE_URL = "http://localhost:8000"

def run_benchmarks():
    algorithms = ["bubble_sort", "quick_sort", "merge_sort", "insertion_sort", "selection_sort", "heap_sort", "shell_sort"]
    languages = ["python", "julia"]
    input_sizes = [10, 50, 100, 250, 500, 750, 1000, 1500, 2000]

    for algo in algorithms:
        for lang in languages:
            for size in input_sizes:
                print(f"Running benchmark for {algo} ({lang}) with size {size}...")
                input_data = [random.randint(1, 1000) for _ in range(size)]
                try:
                    response = requests.post(
                        f"{API_BASE_URL}/benchmark/{algo}?language={lang}",
                        json={"input_data": input_data}
                    )
                    if response.status_code == 200:
                        print(f"  Success: {response.json()['metrics']['time_ms']:.4f} ms")
                    else:
                        print(f"  Failed: {response.status_code}")
                except Exception as e:
                    print(f"  Error: {e}")
                time.sleep(0.1)

if __name__ == "__main__":
    run_benchmarks()
