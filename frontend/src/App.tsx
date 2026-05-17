import { useState } from 'react';
import { Play, Activity, Code, Layers, Terminal, BarChart2, TrendingUp, History } from 'lucide-react';
import { AlgorithmMode, type VersionedAlgorithmContract } from './types';
import { SortingVisualizer } from './components/SortingVisualizer';
import HistoryView from './components/HistoryView';
import ComplexityDashboard from './components/ComplexityDashboard';
import CodeViewer from './components/CodeViewer';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [inputData] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [selectedAlgo, setSelectedAlgo] = useState('bubble_sort');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VersionedAlgorithmContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'visualize' | 'history' | 'complexity' | 'code'>('visualize');
  const [isLowIntensity, setIsLowIntensity] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | undefined>(undefined);
  const [syncSpeed, setSyncSpeed] = useState(150);

  const algorithms = [
    { id: 'bubble_sort', name: 'Bubble Sort' },
    { id: 'quick_sort', name: 'Quick Sort' },
    { id: 'merge_sort', name: 'Merge Sort' },
    { id: 'insertion_sort', name: 'Insertion Sort' },
    { id: 'selection_sort', name: 'Selection Sort' },
    { id: 'heap_sort', name: 'Heap Sort' },
    { id: 'shell_sort', name: 'Shell Sort' },
  ];

  const runAlgorithm = async (mode: AlgorithmMode, language: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${mode === AlgorithmMode.VISUALIZATION ? 'visualize' : 'benchmark'}/${selectedAlgo}?language=${language}`, {
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
    <div className={`relative min-h-screen bg-background text-text overflow-x-hidden ${isLowIntensity ? 'low-intensity' : ''}`}>
      {/* Global Aesthetics Overlay */}
      <div className="scanlines"></div>
      <div className="noise-overlay"></div>

      {/* Space Parallax Stars & Nebula Background */}
      <div className="space-parallax">
        <div className="stars-layer-1"></div>
        <div className="stars-layer-2"></div>
        <div className="stars-layer-3"></div>
        <div className="nebula-cloud-1"></div>
        <div className="nebula-cloud-2"></div>
      </div>

      <header className="relative z-50 pt-10 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="flex items-center gap-6 group">
            <div className="p-4 glass-panel rounded-2xl shadow-premium group-hover:shadow-neon-cyan transition-shadow duration-500">
              <Layers className="w-10 h-10 text-secondary neon-glow-cyan" />
            </div>
            <div>
              <h1 className="text-6xl font-bold tracking-tighter text-gradient-premium font-mono glitch-text" data-text="AlgoVerse">
                AlgoVerse
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <p className="text-text/40 text-[9px] font-bold tracking-[0.3em] uppercase font-mono">
                  Precision DSA Engine v2.0.8
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 px-5 py-2.5 glass-panel rounded-2xl shadow-premium">
              <span className="text-[9px] font-bold text-text/30 uppercase tracking-[0.2em] font-mono">Sync_Speed:</span>
              <input 
                type="range" 
                min="50" 
                max="500" 
                step="50"
                value={syncSpeed}
                onChange={(e) => setSyncSpeed(parseInt(e.target.value))}
                className="w-24 lg:w-32 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-secondary"
              />
              <span className="text-[10px] font-mono text-secondary font-bold w-12">{syncSpeed}ms</span>
            </div>

            <button 
              onClick={() => setIsLowIntensity(!isLowIntensity)}
              className="flex items-center gap-3 px-5 py-2.5 glass-panel rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:border-secondary transition-all cursor-pointer group shadow-premium active:scale-95"
            >
              <Activity size={14} className={isLowIntensity ? 'text-text/20' : 'text-secondary animate-flicker'} />
              <span className={isLowIntensity ? 'text-text/40' : 'text-secondary'}>
                {isLowIntensity ? 'RESTRICTED' : 'PRO_MAX'}
              </span>
            </button>

            <nav className="flex items-center gap-1 p-1.5 glass-panel rounded-[1.5rem] shadow-premium hud-corners hud-corners-tl hud-corners-br" role="tablist">
              {[
                { id: 'visualize', icon: Play, label: 'Visualize' },
                { id: 'history', icon: History, label: 'History' },
                { id: 'complexity', icon: TrendingUp, label: 'Complexity' },
                { id: 'code', icon: Code, label: 'Source' },
              ].map((item) => (
                <button 
                  key={item.id}
                  role="tab"
                  aria-selected={activeView === item.id}
                  aria-label={item.label}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold tracking-wider text-[10px] lg:text-xs uppercase transition-all duration-500 cursor-pointer group ${
                    activeView === item.id 
                      ? 'bg-secondary text-white shadow-neon-cyan' 
                      : 'text-text/30 hover:text-text hover:bg-white/5'
                  }`}
                >
                  <item.icon size={14} className={`${activeView === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        {/* Controls Panel */}
        <aside className="lg:col-span-3 space-y-8">
          <section className="p-8 glass-panel rounded-[2.5rem] shadow-premium hud-corners hud-corners-tl hud-corners-br" aria-labelledby="orchestrator-title">
            <h2 id="orchestrator-title" className="text-sm font-bold mb-8 flex items-center gap-3 text-secondary font-mono tracking-[0.3em] uppercase">
              <Terminal className="w-5 h-5 neon-glow-cyan" />
              SYSTEM_ORCHESTRATOR
            </h2>
            
            <div className="space-y-8">
              <div>
                <label htmlFor="algo-select" className="block text-[10px] font-bold text-text/30 mb-3 uppercase tracking-[0.2em] px-1">Algorithm Selection</label>
                <div className="relative group">
                  <select 
                    id="algo-select"
                    value={selectedAlgo}
                    onChange={(e) => setSelectedAlgo(e.target.value)}
                    className="w-full p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-text font-bold focus:outline-none focus:ring-2 focus:ring-secondary/30 appearance-none cursor-pointer font-mono transition-all duration-300 group-hover:bg-white/[0.05]"
                  >
                    {algorithms.map(algo => (
                      <option key={algo.id} value={algo.id} className="bg-background">{algo.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 group-hover:opacity-100 transition-opacity">
                    <Layers size={14} className="text-secondary" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { id: 'python', name: 'Python' },
                  { id: 'julia', name: 'Julia' },
                  { id: 'rust', name: 'Rust' },
                  { id: 'go', name: 'Go' },
                  { id: 'csharp', name: 'C#' },
                  { id: 'java', name: 'Java' },
                  { id: 'c', name: 'C' },
                  { id: 'cpp', name: 'C++' },
                ].map(lang => (
                  <div key={lang.id} className="grid grid-cols-2 gap-3 p-4 glass-card rounded-2xl border border-white/[0.03]">
                    <div className="col-span-2 mb-2 flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold font-mono tracking-[0.2em] text-text/40 uppercase">{lang.name}</span>
                      <div className="w-1 h-1 rounded-full bg-secondary shadow-neon-cyan"></div>
                    </div>
                    <button
                      aria-label={`Visualize with ${lang.name}`}
                      onClick={() => runAlgorithm(AlgorithmMode.VISUALIZATION, lang.id)}
                      disabled={loading}
                      className="flex items-center justify-center py-3 bg-white/[0.03] hover:bg-secondary hover:text-white disabled:opacity-30 transition-all duration-500 rounded-xl gap-2 group cursor-pointer border border-white/5 font-mono text-[10px] font-bold tracking-widest uppercase"
                    >
                      <Play className="w-3 h-3 group-hover:scale-125 transition-transform" />
                      VISUAL
                    </button>

                    <button
                      aria-label={`Benchmark with ${lang.name}`}
                      onClick={() => runAlgorithm(AlgorithmMode.BENCHMARK, lang.id)}
                      disabled={loading}
                      className="flex items-center justify-center py-3 bg-white/[0.03] hover:bg-accent hover:text-white disabled:opacity-30 transition-all duration-500 rounded-xl gap-2 group cursor-pointer border border-white/5 font-mono text-[10px] font-bold tracking-widest uppercase"
                    >
                      <Activity className="w-3 h-3 group-hover:scale-125 transition-transform" />
                      BENCH
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {result && (
            <section className="p-8 glass-panel rounded-[2.5rem] shadow-premium hud-corners hud-corners-tl hud-corners-br animate-in fade-in slide-in-from-bottom-8 duration-1000" aria-labelledby="telemetry-title">
              <h2 id="telemetry-title" className="text-sm font-bold mb-8 flex items-center gap-3 text-secondary font-mono tracking-[0.3em] uppercase">
                <BarChart2 className="w-5 h-5 neon-glow-cyan" />
                TELEMETRY_HUD
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 glass-card rounded-2xl border-l-4 border-l-secondary relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                  <p className="text-[10px] text-text/30 uppercase tracking-[0.2em] font-bold mb-2">Execution Velocity</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-mono text-gradient-cyan font-bold">
                      {result.metrics.time_ms.toFixed(4)}
                    </p>
                    <span className="text-xs mb-1.5 opacity-30 font-bold uppercase tracking-widest">ms</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-secondary/5 to-transparent"></div>
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-1 flex-1 bg-secondary/10 rounded-full overflow-hidden"
                      >
                        <div 
                          className="h-full bg-secondary"
                          style={{ width: '100%', transitionDelay: `${i * 0.05}s` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 glass-card rounded-2xl border-t border-white/[0.03] group hover:border-secondary/20 transition-all">
                    <p className="text-[10px] text-text/30 uppercase tracking-[0.2em] font-bold mb-2">Complexity</p>
                    <p className="text-xl font-mono text-secondary font-bold tracking-tight group-hover:text-secondary/100 transition-colors">{result.complexity.time}</p>
                  </div>
                  <div className="p-6 glass-card rounded-2xl border-t border-white/[0.03] group hover:border-secondary/20 transition-all">
                    <p className="text-[10px] text-text/30 uppercase tracking-[0.2em] font-bold mb-2">Allocations</p>
                    <p className="text-xl font-mono text-secondary font-bold tracking-tight group-hover:text-secondary/100 transition-colors">{result.complexity.space}</p>
                  </div>
                </div>

                <div className="p-6 glass-card rounded-2xl border-t border-white/[0.03] flex justify-between items-center group">
                  <div>
                    <p className="text-[10px] text-text/30 uppercase tracking-[0.2em] font-bold mb-2">Total Operations</p>
                    <p className="text-2xl font-mono text-text/80 font-bold tracking-tighter">
                      {result.metrics.comparisons?.toLocaleString() ?? '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 group-hover:border-secondary/30 transition-all">
                    <Activity size={20} className="text-secondary/30 group-hover:text-secondary transition-colors" />
                  </div>
                </div>
              </div>
            </section>
          )}
        </aside>

        {/* Display Panel */}
        <section className="lg:col-span-9 space-y-8" aria-live="polite">
          {activeView === 'visualize' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-7 space-y-8 lg:space-y-10">
                <div className="min-h-[640px] glass-panel rounded-[3rem] flex items-center justify-center relative overflow-hidden group shadow-premium">
                  {loading ? (
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <div className="w-20 h-20 border-2 border-secondary/10 border-t-secondary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 bg-secondary/5 blur-2xl animate-pulse"></div>
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-secondary font-mono font-bold tracking-[0.4em] animate-pulse text-xs uppercase">Initializing_Kernel...</p>
                        <p className="text-text/20 font-mono text-[10px] uppercase tracking-widest">Awaiting Remote Response</p>
                      </div>
                    </div>
                  ) : result ? (
                      <div className="w-full h-full p-10 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                        {result.mode === AlgorithmMode.VISUALIZATION && result.events.length > 0 ? (
                          <SortingVisualizer 
                            initialData={inputData} 
                            events={result.events}
                            isLowIntensity={isLowIntensity}
                            onLineChange={setCurrentLine}
                            delay={syncSpeed}
                          />
                        ) : result.final_state ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="mb-8 text-[10px] font-mono text-secondary font-bold uppercase tracking-[0.4em] bg-secondary/5 px-6 py-2 border border-secondary/10 rounded-full shadow-neon-cyan backdrop-blur-md">
                              Benchmark_Steady_State
                            </div>
                            <SortingVisualizer 
                              initialData={result.final_state} 
                              events={[]}
                              isLowIntensity={isLowIntensity}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-8 text-text/40">
                            <div className="relative">
                              <Activity className="w-20 h-20 opacity-20 text-secondary animate-pulse" />
                              <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full"></div>
                            </div>
                            <div className="text-center space-y-2">
                              <p className="uppercase tracking-[0.5em] text-xs font-bold text-gradient-cyan">
                                ANALYTICS_CAPTURE_COMPLETE
                              </p>
                              <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest">All metrics persisted to registry</p>
                            </div>
                            <div className="flex gap-6">
                              <div className="px-8 py-4 glass-card rounded-2xl font-mono text-sm border border-white/[0.03]">
                                <span className="text-secondary font-bold mr-2">{result.metrics.comparisons?.toLocaleString() ?? '0'}</span> 
                                <span className="opacity-30 uppercase text-[10px] tracking-widest">Comp</span>
                              </div>
                              <div className="px-8 py-4 glass-card rounded-2xl font-mono text-sm border border-white/[0.03]">
                                <span className="text-accent font-bold mr-2">{result.metrics.swaps?.toLocaleString() ?? '0'}</span> 
                                <span className="opacity-30 uppercase text-[10px] tracking-widest">Swap</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                  ) : (
                    <div className="text-center px-12 group-hover:scale-105 transition-all duration-1000">
                      <div className="relative mb-8">
                        <Layers className="w-24 h-24 text-secondary/5 mx-auto" />
                        <div className="absolute inset-0 bg-secondary/5 blur-3xl opacity-50 rounded-full"></div>
                      </div>
                      <h3 className="text-text font-bold mb-4 text-3xl tracking-tighter text-gradient-premium">Kernel Standby</h3>
                      <p className="text-text/30 max-w-sm mx-auto font-medium leading-relaxed tracking-wide">
                        Select a language and execution mode from the <span className="text-secondary/60 font-mono text-[10px] font-bold">ORCHESTRATOR</span> to begin stream capture.
                      </p>
                    </div>
                  )}
                  
                  {/* Decorative UI elements */}
                  <div className="absolute top-8 left-8 w-12 h-[1px] bg-white/10"></div>
                  <div className="absolute top-8 left-8 w-[1px] h-12 bg-white/10"></div>
                  <div className="absolute bottom-8 right-8 w-12 h-[1px] bg-white/10"></div>
                  <div className="absolute bottom-8 right-8 w-[1px] h-12 bg-white/10"></div>
                </div>

                <div className="p-10 glass-panel rounded-[2.5rem] shadow-premium relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold flex items-center gap-3 text-text font-mono tracking-[0.2em] uppercase">
                        <Terminal className="w-4 h-4 text-secondary neon-glow-cyan" />
                        CONTRACT_TELEMETRY_STREAM
                      </h2>
                      <p className="text-[9px] font-mono text-text/20 uppercase tracking-[0.1em]">Protocol Version: {result?.version || '2.0.4-alpha'}</p>
                    </div>
                    
                    {result && (
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/5 border border-secondary/10 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-neon-cyan animate-pulse"></div>
                          <span className="text-[9px] font-bold font-mono text-secondary uppercase tracking-widest">
                            {result.language}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-[#010409]/80 rounded-2xl p-8 h-80 overflow-y-auto font-mono text-xs border border-white/[0.03] shadow-inner custom-scrollbar relative">
                    {error ? (
                      <div className="text-red-400/90 flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                        <div className="space-y-1">
                          <p className="font-bold tracking-widest text-[10px]">CRITICAL_SYSTEM_FAILURE</p>
                          <p className="opacity-70">{error}</p>
                        </div>
                      </div>
                    ) : result ? (
                      <pre className="text-text/40 whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-1 h-12 bg-gradient-to-b from-transparent via-secondary/20 to-transparent animate-pulse"></div>
                        <p className="text-text/10 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Awaiting_Input_Data_Stream</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 h-auto lg:h-[1050px] lg:sticky lg:top-8 order-last lg:order-none">
                <CodeViewer 
                  algorithm={selectedAlgo} 
                  isLowIntensity={isLowIntensity} 
                  highlightedLine={currentLine} 
                  selectedLanguage={result?.language}
                />
              </div>
            </div>
          )}

          {activeView === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <HistoryView algorithm={selectedAlgo} isLowIntensity={isLowIntensity} />
            </div>
          )}

          {activeView === 'complexity' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <ComplexityDashboard algorithm={selectedAlgo} isLowIntensity={isLowIntensity} />
            </div>
          )}

          {activeView === 'code' && (
            <div className="h-[800px] animate-in fade-in slide-in-from-bottom-8 duration-700">
              <CodeViewer 
                algorithm={selectedAlgo} 
                isLowIntensity={isLowIntensity} 
                selectedLanguage={result?.language}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

