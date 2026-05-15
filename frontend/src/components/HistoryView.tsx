import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BenchmarkRun } from '../types';
import { Clock, Database, Activity, TrendingUp } from 'lucide-react';

interface HistoryViewProps {
    algorithm: string;
}

const HistoryView: React.FC<HistoryViewProps> = ({ algorithm }) => {
    const [history, setHistory] = useState<BenchmarkRun[]>([]);
    const [loading, setLoading] = useState(false);

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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
                <p className="text-gray-400">No historical data available for this algorithm yet.</p>
                <p className="text-sm text-gray-500 mt-2">Run a few benchmarks to see trends!</p>
            </div>
        );
    }

    // Group data for the chart: input_size vs execution_time_ms by language
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Runs Logged</p>
                        <p className="text-xl font-bold text-white">{history.length}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Avg Speed</p>
                        <p className="text-xl font-bold text-white">
                            {(history.reduce((sum, r) => sum + r.execution_time_ms, 0) / history.length).toFixed(2)}ms
                        </p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Complexity</p>
                        <p className="text-xl font-bold text-white">O(n log n)</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center space-x-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
                        <Database size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Data Points</p>
                        <p className="text-xl font-bold text-white">{chartData.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-400" size={20} />
                    Performance Scalability (Time vs Input Size)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="input_size" 
                                stroke="#9CA3AF" 
                                fontSize={12}
                                label={{ value: 'Input Size (n)', position: 'insideBottomRight', offset: -5, fill: '#9CA3AF' }}
                            />
                            <YAxis 
                                stroke="#9CA3AF" 
                                fontSize={12}
                                label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="python" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Python Orchestrator" />
                            <Line type="monotone" dataKey="julia" stroke="#A855F7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Julia Engine" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Lang</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Memory</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {history.slice(0, 10).map((run) => (
                            <tr key={run.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {new Date(run.run_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        run.language === 'julia' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {run.language}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{run.input_size}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">{run.execution_time_ms.toFixed(4)}ms</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {run.memory_used_kb ? `${run.memory_used_kb.toFixed(2)} KB` : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryView;
