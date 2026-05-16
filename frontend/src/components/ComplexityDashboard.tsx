import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Settings2, Zap, TrendingUp } from 'lucide-react';

import { type BenchmarkRun } from '../types';

interface TheoreticalPoint {
    n: number;
    theoretical_value: number;
}

interface ComplexityData {
    algorithm: string;
    complexity: string;
    actual_runs: BenchmarkRun[];
    theoretical_points: TheoreticalPoint[];
}

const ComplexityDashboard: React.FC<{ algorithm: string, isLowIntensity?: boolean }> = ({ algorithm, isLowIntensity = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [data, setData] = useState<ComplexityData | null>(null);
    const [constantFactor, setConstantFactor] = useState(0.00001);
    const [useLogScale, setUseLogScale] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: any } | null>(null);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/complexity/${algorithm}`);
                const json = await response.json();
                setData(json);
            } catch (err) {
                console.error("Failed to fetch complexity data", err);
            }
        };
        fetchData();
    }, [algorithm]);

    // Handle Resize
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: 400
                });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // D3 Rendering
    useEffect(() => {
        if (!data || !svgRef.current || dimensions.width === 0) return;

        const margin = { top: 40, right: 180, bottom: 60, left: 80 };
        const innerWidth = dimensions.width - margin.left - margin.right;
        const innerHeight = dimensions.height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Initial clear for setup

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Prepare data
        const pythonActual = data.actual_runs.filter(r => r.language === 'python');
        const juliaActual = data.actual_runs.filter(r => r.language === 'julia');
        
        // Calibrate theoretical points
        const theoretical = data.theoretical_points.map(p => ({
            n: p.n,
            val: p.theoretical_value * constantFactor
        }));

        // Scales
        const xDomain = [
            d3.min(data.theoretical_points, d => d.n) || 1,
            d3.max(data.theoretical_points, d => d.n) || 1000
        ];
        
        const xScale = useLogScale 
            ? d3.scaleLog().domain(xDomain).range([0, innerWidth])
            : d3.scaleLinear().domain([0, xDomain[1]]).range([0, innerWidth]);

        const maxVal = d3.max([
            ...pythonActual.map(d => d.execution_time_ms),
            ...juliaActual.map(d => d.execution_time_ms),
            ...theoretical.map(d => d.val)
        ]) || 1;

        const yScale = useLogScale
            ? d3.scaleLog().domain([0.0001, maxVal * 1.2]).range([innerHeight, 0])
            : d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0]);

        // Grids
        const xGrid = d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(() => "");
        const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "");

        g.append("g")
            .attr("class", `grid ${isLowIntensity ? 'text-white/5' : 'text-secondary/5'}`)
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xGrid);

        g.append("g")
            .attr("class", `grid ${isLowIntensity ? 'text-white/5' : 'text-secondary/5'}`)
            .call(yGrid);

        // Axes
        const xAxis = d3.axisBottom(xScale).ticks(dimensions.width / 100, "~s");
        const yAxis = d3.axisLeft(yScale).ticks(10, "~s");

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .attr("class", "text-zinc-500")
            .append("text")
            .attr("x", innerWidth / 2)
            .attr("y", 45)
            .attr("fill", "currentColor")
            .attr("class", "text-[10px] uppercase tracking-widest font-bold")
            .text("Input Size (n)");

        g.append("g")
            .call(yAxis)
            .attr("class", "text-zinc-500")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -innerHeight / 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "middle")
            .attr("class", "text-[10px] uppercase tracking-widest font-bold")
            .text("Execution Time (ms)");

        // Line Generator
        const lineGen = d3.line<{n: number, val: number}>()
            .x(d => xScale(d.n))
            .y(d => yScale(Math.max(d.val, 0.0001)))
            .curve(d3.curveMonotoneX);

        // Theoretical Path - Switched to Cyan
        g.append("path")
            .datum(theoretical)
            .attr("fill", "none")
            .attr("stroke", "#00f3ff") 
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4,4")
            .attr("opacity", isLowIntensity ? 0.3 : 0.5)
            .attr("d", lineGen as any);

        // Actual Data Points & Lines
        const plotSeries = (seriesData: {n: number, val: number}[], color: string, label: string) => {
            if (seriesData.length === 0) return;

            // Line
            g.append("path")
                .datum(seriesData)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 3)
                .attr("class", "series-line")
                .attr("d", lineGen as any)
                .attr("opacity", isLowIntensity ? 0.7 : 1);

            // Points
            g.selectAll(`.dot-${label}`)
                .data(seriesData)
                .enter()
                .append("circle")
                .attr("class", `dot-${label} cursor-pointer`)
                .attr("cx", d => xScale(d.n))
                .attr("cy", d => yScale(Math.max(d.val, 0.0001)))
                .attr("r", isLowIntensity ? 4 : 5)
                .attr("fill", color)
                .attr("stroke", "#020617")
                .attr("stroke-width", 2)
                .on("mouseenter", (event, d) => {
                    const [mx, my] = d3.pointer(event, containerRef.current);
                    setTooltip({ x: mx, y: my, data: { ...d, label } });
                })
                .on("mouseleave", () => setTooltip(null));
        };

        plotSeries(pythonActual.map(d => ({n: d.input_size, val: d.execution_time_ms})), "#00f3ff", "Python"); // Cyan
        plotSeries(juliaActual.map(d => ({n: d.input_size, val: d.execution_time_ms})), "#ff00ff", "Julia"); // Magenta

        // Legend
        const legend = g.append("g")
            .attr("transform", `translate(${innerWidth + 30}, 0)`);

        const categories = [
            { label: 'Python Engine', color: '#00f3ff' },
            { label: 'Julia Engine', color: '#ff00ff' },
            { label: `Theoretical ${data.complexity}`, color: '#00f3ff', dash: true }
        ];

        categories.forEach((cat, i) => {
            const row = legend.append("g").attr("transform", `translate(0, ${i * 28})`);
            row.append("line")
                .attr("x1", 0).attr("x2", 20)
                .attr("y1", 0).attr("y2", 0)
                .attr("stroke", cat.color)
                .attr("stroke-width", 3)
                .attr("stroke-dasharray", cat.dash ? "4,2" : "0")
                .attr("opacity", isLowIntensity ? 0.6 : 1);
            
            row.append("text")
                .attr("x", 30)
                .attr("y", 5)
                .attr("fill", cat.color)
                .attr("class", "text-[11px] font-bold uppercase tracking-wider")
                .attr("opacity", isLowIntensity ? 0.5 : 1)
                .text(cat.label);
        });

    }, [data, constantFactor, useLogScale, dimensions, isLowIntensity]);

    if (!data) return (
        <div className="h-[500px] flex items-center justify-center bg-background rounded-3xl border border-white/5">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Initializing Analyzer...</p>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            ref={containerRef}
        >
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group hud-corners hud-corners-tl hud-corners-br">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-secondary neon-glow-cyan" />
                            <h2 className="text-2xl font-bold text-white tracking-tight">Asymptotic Engine</h2>
                        </div>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Correlation analysis between empirical benchmark results and theoretical complexity growth curves.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 glass-card p-1.5 rounded-2xl border border-white/5">
                        <button 
                            onClick={() => setUseLogScale(false)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${!useLogScale ? 'btn-premium text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Linear
                        </button>
                        <button 
                            onClick={() => setUseLogScale(true)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${useLogScale ? 'btn-premium text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Log-Log
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-9 relative">
                        <svg ref={svgRef} className="w-full h-[400px] text-zinc-100"></svg>
                        
                        <AnimatePresence>
                            {tooltip && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute pointer-events-none bg-background/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md z-50"
                                    style={{ left: tooltip.x + 15, top: tooltip.y - 40 }}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tooltip.data.label === 'Python' ? '#00f3ff' : '#ff00ff' }} />
                                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">{tooltip.data.label} Engine</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Input N</span>
                                        <span className="text-xs font-mono text-zinc-200 text-right">{tooltip.data.n}</span>
                                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Time</span>
                                        <span className="text-xs font-mono text-secondary text-right">{tooltip.data.val.toFixed(3)}ms</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Calibration</h3>
                                <Settings2 className="w-4 h-4 text-zinc-700" />
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-[10px] text-zinc-600 mb-2 font-mono">
                                    <span>Factor c</span>
                                    <span className="text-secondary">{constantFactor.toExponential(2)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="-12" 
                                    max="0" 
                                    step="0.1" 
                                    value={Math.log10(constantFactor)} 
                                    onChange={(e) => setConstantFactor(Math.pow(10, parseFloat(e.target.value)))}
                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-secondary"
                                />
                                <p className="text-[9px] text-zinc-600 mt-3 leading-relaxed italic">
                                    Adjust $c$ to align theoretical $O(n \cdot f(n))$ with empirical data.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card p-5 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Algorithm</h3>
                                <Zap className="w-4 h-4 text-secondary/50" />
                            </div>
                            <div className="text-3xl font-mono font-bold text-gradient-cyan mb-1">{data.complexity}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">{algorithm.replace('_', ' ')}</div>
                        </div>

                        <div className="bg-secondary/5 p-5 rounded-2xl border border-secondary/20">
                            <div className="flex items-center gap-2 mb-2 text-secondary">
                                <Info size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Insights</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                                {useLogScale 
                                    ? "Log-Log scales linearize polynomial growth, making it easier to identify the exponent from the line slope."
                                    : "Linear scales emphasize the explosive nature of high-order complexity as N increases."}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Visual accents - hidden in low intensity */}
                {!isLowIntensity && (
                    <>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none rounded-full" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 blur-[100px] pointer-events-none rounded-full" />
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default ComplexityDashboard;
