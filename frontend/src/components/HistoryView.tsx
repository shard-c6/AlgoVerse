import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import type { BenchmarkRun } from '../types';
import { Clock, Database, Activity, TrendingUp, History, Filter, ChevronRight, Zap, Terminal } from 'lucide-react';

interface HistoryViewProps {
    algorithm: string;
    isLowIntensity?: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({ algorithm, isLowIntensity }) => {
    const [history, setHistory] = useState<BenchmarkRun[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<BenchmarkRun | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/history/${algorithm}`);
                const data = await response.json();
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [algorithm]);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center glass-panel rounded-[2rem] border border-white/5">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-secondary/10 border-t-secondary rounded-full animate-spin" />
                        <div className="absolute inset-0 bg-secondary/10 blur-xl animate-pulse"></div>
                    </div>
                    <p className="text-secondary/40 font-mono text-[10px] tracking-[0.4em] uppercase font-bold animate-pulse">Retrieving_Chronicles...</p>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="glass-panel rounded-[2rem] p-16 text-center border border-white/5 hud-corners hud-corners-tl hud-corners-br">
                <History className="w-16 h-16 text-text/10 mx-auto mb-6" />
                <p className="text-text/40 font-bold uppercase tracking-widest text-xs">Chronicle_Empty</p>
                <p className="text-[10px] text-text/20 mt-3 font-mono uppercase tracking-[0.2em]">Initialize benchmarks to populate the temporal logs.</p>
            </div>
        );
    }

    const chartData = history.reduce((acc: any[], run) => {
        const existing = acc.find(item => item.input_size === run.input_size);
        if (existing) {
            existing[run.language] = run.execution_time_ms;
        } else {
            acc.push({
                input_size: run.input_size,
                [run.language]: run.execution_time_ms
            });
        }
        return acc;
    }, []).sort((a, b) => a.input_size - b.input_size);

    return (
        <div className="space-y-8 pb-12">
            {/* Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Cycles', val: history.length, icon: History, color: 'secondary' },
                    { label: 'Latency Avg', val: `${(history.reduce((sum, r) => sum + r.execution_time_ms, 0) / history.length).toFixed(2)}ms`, icon: Clock, color: 'text' },
                    { label: 'Asymptotic', val: 'O(n log n)', icon: Activity, color: 'secondary' },
                    { label: 'Nodes Logged', val: chartData.length, icon: Database, color: 'text' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-5 rounded-2xl border border-white/5 flex items-center space-x-5 group hover:border-secondary/20 transition-all">
                        <div className={`p-3.5 rounded-xl bg-background border border-white/5 transition-all group-hover:scale-110 ${stat.color === 'secondary' ? 'text-secondary neon-glow-cyan' : 'text-text/40'}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-text/20 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                            <p className="text-xl font-mono font-bold text-text/80">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Visualizer Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 glass-panel p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden hud-corners hud-corners-tl hud-corners-br">
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-secondary/5 rounded-xl border border-secondary/10">
                                <TrendingUp className="text-secondary neon-glow-cyan" size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text font-mono uppercase tracking-[0.2em]">Performance_Matrix</h3>
                                <p className="text-[9px] text-text/20 uppercase tracking-widest mt-0.5">Execution time across data scales</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2 bg-background/50 rounded-full border border-white/5 backdrop-blur-md">
                            <div className={`w-1.5 h-1.5 rounded-full bg-secondary shadow-neon-cyan ${isLowIntensity ? '' : 'animate-pulse'}`} />
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.3em]">Live_Engine_Active</span>
                        </div>
                    </div>
                    
                    <div className="h-96 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <defs>
                                    <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gradientMagenta" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                <XAxis 
                                    dataKey="input_size" 
                                    stroke="rgba(255,255,255,0.1)" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                                    label={{ value: 'DATA_SCALE_N', position: 'insideBottomRight', offset: -12, fill: 'rgba(255,255,255,0.15)', fontSize: 9, fontWeight: 'bold', letterSpacing: '0.2em' }}
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.1)" 
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                                    label={{ value: 'EXECUTION_LATENCY_MS', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.15)', fontSize: 9, fontWeight: 'bold', letterSpacing: '0.2em', offset: 10 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(2, 6, 23, 0.9)', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '16px', 
                                        backdropFilter: 'blur(12px)', 
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontFamily: 'var(--font-mono)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ 
                                        paddingBottom: '30px', 
                                        fontSize: '9px', 
                                        textTransform: 'uppercase', 
                                        fontWeight: 'bold', 
                                        letterSpacing: '0.2em',
                                        opacity: 0.6
                                    }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="python" 
                                    stroke="var(--color-secondary)" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: 'var(--color-secondary)', strokeWidth: 0 }} 
                                    activeDot={{ r: 6, stroke: 'var(--color-secondary)', strokeWidth: 2, fill: '#000' }} 
                                    name="Python_Stream" 
                                    isAnimationActive={!isLowIntensity}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="julia" 
                                    stroke="var(--color-accent)" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: 'var(--color-accent)', strokeWidth: 0 }} 
                                    activeDot={{ r: 6, stroke: 'var(--color-accent)', strokeWidth: 2, fill: '#000' }} 
                                    name="Julia_Stream" 
                                    isAnimationActive={!isLowIntensity}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Background Visual Accents */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/[0.02] blur-[120px] pointer-events-none"></div>
                </div>

                {/* History Log - Chronicle Style */}
                <div className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <Terminal size={16} className="text-secondary/60" />
                            <h3 className="text-[10px] font-bold text-text/40 uppercase tracking-[0.3em]">CHRONICLE_LOG</h3>
                        </div>
                        <div className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                            <Filter className="w-3.5 h-3.5 text-text/20 group-hover:text-secondary transition-colors" />
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar space-y-4 relative z-10">
                        {history.slice(0, 20).map((run, i) => (
                            <motion.div 
                                initial={isLowIntensity ? { opacity: 1 } : { opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={run.id}
                                onClick={() => setSelectedRun(run)}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                                    selectedRun?.id === run.id 
                                    ? 'bg-secondary/10 border-secondary/30 shadow-neon-cyan/10' 
                                    : 'bg-white/[0.02] border-white/[0.03] hover:border-secondary/20 hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${run.language === 'julia' ? 'bg-accent' : 'bg-secondary'} ${selectedRun?.id === run.id ? 'animate-pulse shadow-neon-cyan' : ''}`} />
                                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${selectedRun?.id === run.id ? 'text-secondary' : 'text-text/40'}`}>
                                            {run.language}
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-mono text-text/10 group-hover:text-text/30 transition-colors uppercase tracking-widest">
                                        {new Date(run.run_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[8px] text-text/10 uppercase font-bold tracking-[0.2em] mb-1">Scale_N: {run.input_size}</div>
                                        <div className="text-lg font-mono font-bold text-text/70 group-hover:text-text transition-colors">
                                            {run.execution_time_ms.toFixed(3)}
                                            <span className="text-[10px] text-text/20 ml-1.5 font-normal uppercase tracking-widest">ms</span>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-lg border border-white/5 transition-all ${selectedRun?.id === run.id ? 'bg-secondary/20 border-secondary/30 scale-110' : 'bg-background/50 opacity-0 group-hover:opacity-100'}`}>
                                        <ChevronRight className={`w-3.5 h-3.5 ${selectedRun?.id === run.id ? 'text-white' : 'text-secondary'}`} />
                                    </div>
                                </div>
                                {selectedRun?.id === run.id && (
                                    <div className="absolute top-0 right-0 w-1 h-full bg-secondary shadow-neon-cyan"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Run Detail Slide-over / HUD Overlay */}
            <AnimatePresence>
                {selectedRun && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="glass-panel p-10 rounded-[3rem] border border-secondary/20 shadow-premium relative overflow-hidden hud-corners hud-corners-tl hud-corners-br"
                    >
                        <div className="absolute top-8 right-10 z-20">
                            <button 
                                onClick={() => setSelectedRun(null)}
                                className="text-[9px] font-mono font-bold text-text/20 hover:text-secondary transition-colors cursor-pointer uppercase tracking-[0.4em] px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-secondary/30"
                            >
                                [ TERMINATE_SESSION ]
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
                            <div className="md:col-span-4 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Zap size={18} className="text-accent neon-glow-magenta" />
                                    </div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text/40">RUNTIME_ANALYSIS</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-6xl font-mono font-bold text-text tracking-tighter leading-none">
                                        {selectedRun.execution_time_ms.toFixed(4)}
                                        <span className="text-xl text-text/20 ml-4 font-normal uppercase tracking-widest">ms</span>
                                    </div>
                                    <p className="text-[10px] text-secondary font-mono font-bold uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-neon-cyan animate-pulse"></span>
                                        Precision_Telemetry_Captured
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-5 grid grid-cols-2 gap-4">
                                {[
                                    { label: 'KERNEL_LANG', val: selectedRun.language },
                                    { label: 'DATA_SCALE', val: selectedRun.input_size },
                                    { label: 'HEAP_USAGE', val: `${selectedRun.memory_used_kb?.toFixed(2) || 'N/A'} KB` },
                                    { label: 'PROTOCOL_ID', val: `0x${selectedRun.id.toString().slice(-6).toUpperCase()}` }
                                ].map((item, i) => (
                                    <div key={i} className="p-5 bg-background/40 rounded-2xl border border-white/5 group hover:border-secondary/20 transition-all">
                                        <div className="text-[9px] text-text/20 uppercase font-bold tracking-[0.2em] mb-2">{item.label}</div>
                                        <div className="text-sm font-mono font-bold text-text/70 uppercase group-hover:text-secondary transition-colors">{item.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="md:col-span-3 flex flex-col justify-center border-l border-white/5 pl-10">
                                <div className="space-y-4">
                                    <p className="text-[11px] text-text/40 font-medium leading-relaxed uppercase tracking-wider">
                                        Verified execution node representing a distinct cycle in the temporal history of {algorithm.replace('_', ' ')}.
                                    </p>
                                    <div className="pt-4 flex flex-col gap-2">
                                        <div className="h-[1px] w-full bg-gradient-to-r from-secondary/20 to-transparent"></div>
                                        <div className="h-[1px] w-2/3 bg-gradient-to-r from-accent/20 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Element */}
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/[0.03] blur-[100px] rounded-full"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HistoryView;
