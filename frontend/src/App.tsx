import { useState } from 'react';
import { Play, Activity, Code, Layers, Terminal } from 'lucide-react';
import { AlgorithmMode, type VersionedAlgorithmContract } from './types';
import { SortingVisualizer } from './components/SortingVisualizer';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [inputData] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VersionedAlgorithmContract | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAlgorithm = async (mode: AlgorithmMode, language: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${mode === AlgorithmMode.VISUALIZATION ? 'visualize' : 'benchmark'}/bubble_sort?language=${language}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_data: inputData }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to run algorithm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            AlgoVerse
          </h1>
        </div>
        <p className="text-zinc-400 text-lg max-w-2xl">
          High-performance DSA visualization, analysis, and benchmarking platform.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Algorithm Controls
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2 uppercase tracking-wider">Algorithm</label>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200">
                  Bubble Sort
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => runAlgorithm(AlgorithmMode.VISUALIZATION, 'python')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all rounded-xl gap-2 group shadow-lg shadow-indigo-500/10"
                >
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Visualize</span>
                  <span className="text-[10px] opacity-60">Python</span>
                </button>

                <button
                  onClick={() => runAlgorithm(AlgorithmMode.BENCHMARK, 'julia')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-all rounded-xl gap-2 group shadow-lg shadow-cyan-500/10"
                >
                  <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Benchmark</span>
                  <span className="text-[10px] opacity-60">Julia</span>
                </button>
              </div>
            </div>
          </section>

          {result && (
            <section className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Performance Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Time</p>
                  <p className="text-lg font-mono text-emerald-400">{result.metrics.time_ms.toFixed(4)} ms</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Comparisons</p>
                  <p className="text-lg font-mono text-indigo-400">{result.metrics.comparisons || 0}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Time complexity</p>
                  <p className="text-lg font-mono text-amber-400">{result.complexity.time}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Space complexity</p>
                  <p className="text-lg font-mono text-cyan-400">{result.complexity.space}</p>
                </div>
              </div>
            </section>
          )}
        </aside>

        {/* Display Panel */}
        <section className="lg:col-span-8 space-y-6">
          <div className="h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center justify-center relative overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-zinc-400 font-medium animate-pulse">Executing algorithm on server...</p>
              </div>
            ) : result ? (
                <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                  {result.mode === AlgorithmMode.VISUALIZATION && result.events.length > 0 ? (
                    <SortingVisualizer 
                      initialData={inputData} 
                      events={result.events} 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-500">
                      <Activity className="w-12 h-12 opacity-20" />
                      <p className="uppercase tracking-widest text-sm italic">
                        Benchmarking complete. High-N scale achieved.
                      </p>
                      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs">
                        {result.metrics.comparisons} comparisons | {result.metrics.swaps} swaps
                      </div>
                    </div>
                  )}
                </div>
            ) : (
              <div className="text-center px-12">
                <Layers className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-zinc-400 font-medium mb-2 text-xl">No Active Execution</h3>
                <p className="text-zinc-600">Select an execution mode from the left to begin analysis.</p>
              </div>
            )}
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Execution Log (Contract v{result?.version || '1.0'})
              </h2>
              {result && (
                <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                  {result.language} @ {result.mode}
                </span>
              )}
            </div>
            
            <div className="bg-zinc-950 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm border border-zinc-800">
              {error ? (
                <div className="text-red-400 flex items-center gap-2">
                  <span className="text-lg font-bold">!</span> {error}
                </div>
              ) : result ? (
                <pre className="text-zinc-400 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="text-zinc-700 italic">Waiting for input...</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
