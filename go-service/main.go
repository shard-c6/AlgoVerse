package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/rs/cors"
)

func runHandler(w http.ResponseWriter, r *http.Request, mode AlgorithmMode) {
	var req RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	algo := req.Algorithm
	if algo == "" {
		// Fallback for path-based if needed, but backend sends it in body
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 {
			algo = parts[2]
		}
	}

	result := runSort(algo, req.Data, mode)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func visualizeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	runHandler(w, r, Visualization)
}

func benchmarkHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	runHandler(w, r, Benchmark)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/visualize", visualizeHandler)
	mux.HandleFunc("/benchmark", benchmarkHandler)

	handler := cors.Default().Handler(mux)

	fmt.Println("Go Execution Engine starting on port 8082...")
	log.Fatal(http.ListenAndServe(":8082", handler))
}
