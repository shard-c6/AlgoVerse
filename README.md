# 🌌 AlgoVerse

![AlgoVerse Banner](assets/banner.png)

**AlgoVerse** is a professional-grade, multilingual DSA (Data Structures & Algorithms) visualization, analysis, and benchmarking platform. Designed for engineers and students alike, it combines the interactive beauty of modern web frameworks with the high-performance analytical power of the Julia language.

Unlike traditional visualizers, AlgoVerse treats algorithms as **data pipelines**. It uses a strictly versioned contract system to orchestrate execution across multiple languages, ensuring that performance benchmarks are as precise as the visualizations are fluid.

---

## 🚀 Key Features

- **Polyglot Execution**: Compare algorithm logic across Python, Julia, Rust, Go, C#, Java, C, and C++.
- **High-Performance Benchmarking**: Leverages language-specific profiling tools (e.g., `BenchmarkTools.jl` for Julia, `std::chrono` for C++) for industry-standard performance metrics.
- **Contract-Driven Visualization**: Real-time event replay system driven by a strict, unified JSON contract across all service backends.
- **Complexity Analysis**: Automated asymptotic analysis and O-notation curve plotting (D3.js integration).
- **Persistent Analytics Engine**: A dedicated microservice architecture using FastAPI, Oxygen.jl, Axum (Rust), and more to handle high-performance execution.
- **Interactive Replay**: Pause, rewind, and step through algorithm execution events.

---

## 🏗️ Technical Architecture

AlgoVerse is built as a modular monorepo, separating orchestration from execution and visualization.

### 1. **The Orchestrator (Backend)**
- **Tech**: FastAPI (Python)
- **Role**: Acts as the API Gateway. It handles input validation, proxies requests to language-specific engines, and manages the algorithm execution lifecycle.

### 2. **The Execution Engines (Microservices)**
- **Julia**: Port 8080 (`Oxygen.jl`)
- **Rust**: Port 8081 (`Axum`)
- **Go**: Port 8082 (`Standard Net/HTTP`)
- **C#**: Port 8083 (`ASP.NET Core`)
- **Java**: Port 8084 (`Javalin/Maven`)
- **C/C++**: Port 8085 (`Cpp-Http-Lib`)

### 3. **The Lab (Frontend)**
- **Tech**: React (Vite + TypeScript), Tailwind CSS, Framer Motion
- **Role**: A premium dashboard that renders the algorithm replay. It uses a generic replay engine that supports a unified contract for all supported languages.

---

## 📜 The AlgoVerse Contract (v1.0)

At the heart of the project is the `VersionedAlgorithmContract`. Every execution produces a standardized JSON payload:

```json
{
  "version": "1.0",
  "algorithm": "quicksort",
  "language": "rust",
  "events": [
    { "type": "COMPARE", "indices": [0, 1], "metadata": { "pivot": 42 } },
    { "type": "SWAP", "indices": [0, 5] }
  ],
  "metrics": {
    "execution_time_ns": 1500,
    "memory_allocated_bytes": 256,
    "complexity": "O(n log n)"
  }
}
```

This decoupling allows for seamless expansion into any language that can produce JSON.

---

## 🛠️ Getting Started

### Prerequisites
- **Python 3.9+**
- **Julia 1.10+**
- **Rust (Cargo)**
- **Go 1.20+**
- **.NET 8+**
- **JDK 17+**
- **GCC/G++**
- **Node.js 18+**

### Local Setup (One-Click)
We provide a helper script to spin up the entire stack, including automatic port cleanup.

```bash
# Clone the repository
git clone https://github.com/your-username/AlgoVerse.git
cd AlgoVerse

# Run the local development stack
chmod +x run_local.sh
./run_local.sh
```

---

## 🗺️ Roadmap

- [x] **Phase 1**: Core Orchestrator + Julia Service Integration.
- [x] **Phase 2**: Versioned Contract & Scaling Algorithm Engine (Quick, Merge, Insertion Sort).
- [x] **Phase 3**: Persistence Layer (SQLite) for Benchmark History.
- [x] **Phase 4**: D3.js Asymptotic Complexity Dashboard.
- [x] **Phase 5**: Rust Execution Engine & WebAssembly Support.
- [x] **Phase 6**: Code Snippet Viewer with Syntax Highlighting.
- [x] **Phase 7**: Polyglot Expansion (Go, C, C++, C#, Java).
- [ ] **Phase 8**: "Battle Mode" (Side-by-side language performance comparison).

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ for the engineering community.
