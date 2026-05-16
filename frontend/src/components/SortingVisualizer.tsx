import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { type AlgorithmEvent, EventCategory } from '../types';

interface SortingVisualizerProps {
  initialData: number[];
  events: AlgorithmEvent[];
  onComplete?: () => void;
  onLineChange?: (line: number) => void;
  isLowIntensity?: boolean;
  delay?: number;
}

export const SortingVisualizer = ({ 
  initialData, 
  events, 
  onComplete,
  onLineChange,
  isLowIntensity = false,
  delay: customDelay
}: SortingVisualizerProps) => {
  const [data, setData] = useState<{ id: number; value: number }[]>(
    initialData.map((val, idx) => ({ id: idx, value: val }))
  );
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [activeOp, setActiveOp] = useState<string>('IDLE');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxVal = Math.max(...initialData, 1);

  useEffect(() => {
    setData(initialData.map((val, idx) => ({ id: idx, value: val })));
    setCurrentEventIndex(-1);
    setActiveIndices([]);
    setDescription('');
    setActiveOp('READY');
  }, [initialData]);

  useEffect(() => {
    if (currentEventIndex < events.length - 1 && !isPaused) {
      // Prioritize customDelay from syncSpeed controller, then low intensity mode
      const activeDelay = customDelay ?? (isLowIntensity ? 300 : 150);
      
      timerRef.current = setTimeout(() => {
        const nextIndex = currentEventIndex + 1;
        const event = events[nextIndex];
        processEvent(event);
        setCurrentEventIndex(nextIndex);
      }, activeDelay);
    } else if (currentEventIndex === events.length - 1) {
      setActiveIndices([]);
      setActiveOp('COMPLETE');
      if (onComplete) onComplete();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentEventIndex, events, isPaused, isLowIntensity]);

  const processEvent = (event: AlgorithmEvent) => {
    if (event.description) {
      setDescription(event.description);
    }

    if (event.metadata?.line_number && onLineChange) {
      onLineChange(event.metadata.line_number);
    }

    setActiveOp(event.category.toUpperCase());

    if (event.category === EventCategory.INITIAL) {
      if (event.values) setData(event.values.map((v, i) => ({ id: i, value: v })));
      setActiveIndices([]);
    } else if (event.category === EventCategory.FINAL) {
      if (event.values) setData(event.values.map((v, i) => ({ id: i, value: v })));
      setActiveIndices([]);
    } else if (event.category === EventCategory.COMPARISON) {
      setActiveIndices(event.indices || []);
    } else if (event.category === EventCategory.ARRAY_MUTATION) {
      setActiveIndices(event.indices || []);
      if (event.indices && event.values) {
        const newData = [...data];
        event.indices.forEach((idx, i) => {
          newData[idx] = { ...newData[idx], value: event.values![i] };
        });
        setData(newData);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative py-12 px-10">
      {/* Execution HUD - Top Bar Pattern - Responsive Layout */}
      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row justify-between items-start z-20 pointer-events-none gap-4">
        <div className="flex flex-col gap-3 sm:gap-4 pointer-events-auto w-full sm:w-auto">
          <div className="glass-panel p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-premium border border-white/[0.03] min-w-0 sm:min-w-[300px] relative overflow-hidden group hud-corners hud-corners-tl hud-corners-br">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                isPaused 
                  ? 'bg-yellow-500' 
                  : `bg-secondary shadow-neon-cyan ${isLowIntensity ? '' : 'animate-pulse'}`
              }`}></div>
              <span className="text-[8px] sm:text-[10px] font-black text-secondary uppercase tracking-[0.3em] font-mono">Live_Data_Stream</span>
              <div className="ml-auto flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full bg-white/10"></div>
                ))}
              </div>
            </div>
            <p className="text-[10px] sm:text-xs font-mono text-text/80 leading-relaxed min-h-[40px] sm:min-h-[48px] border-l-2 border-white/5 pl-4 py-1 italic">
              {description || 'System standby. Awaiting synchronization...'}
            </p>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 hidden sm:block">
               <Terminal size={120} />
            </div>
          </div>
          
          <div className="glass-panel px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-premium border border-white/[0.03] inline-flex items-center gap-3 sm:gap-4 w-fit hud-corners hud-corners-tl">
            <span className="text-[8px] sm:text-[9px] font-bold text-text/30 uppercase tracking-[0.3em] font-mono">Execution_Node:</span>
            <span className="text-[10px] sm:text-[11px] font-mono text-gradient-cyan font-bold tracking-widest">{activeOp}</span>
          </div>
        </div>
        
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-premium border border-white/[0.03] pointer-events-auto text-left sm:text-right w-full sm:w-auto min-w-0 sm:min-w-[160px] group hud-corners hud-corners-br">
          <div className="text-[8px] sm:text-[9px] font-black text-text/30 uppercase tracking-[0.3em] font-mono mb-1 sm:mb-2 group-hover:text-secondary transition-colors">Capture_Progress</div>
          <div className="text-3xl sm:text-4xl font-mono text-text font-bold tracking-tighter leading-none mb-2 sm:mb-3">
            <span className="text-gradient-premium">{((currentEventIndex + 1) / Math.max(events.length, 1) * 100).toFixed(0)}</span>
            <span className="text-xs text-text/20 ml-1 font-normal">%</span>
          </div>
          <div className="w-full bg-white/[0.03] h-1 sm:h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
            <motion.div 
              className="h-full bg-gradient-to-r from-secondary/40 to-secondary shadow-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${((currentEventIndex + 1) / Math.max(events.length, 1) * 100)}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* Visualizer Area - Refined Layout */}
      <div className="flex items-end justify-center gap-2 w-full h-[320px] mt-24 relative px-4">
        {/* Subtle scanline effect only for visualizer area, hidden in low intensity */}
        {!isLowIntensity && (
          <div className="absolute inset-x-0 bottom-0 top-[-20%] bg-gradient-to-t from-secondary/[0.02] to-transparent pointer-events-none rounded-t-3xl"></div>
        )}
        
        {data.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={false}
            animate={{
              height: `${(item.value / maxVal) * 100}%`,
              background: activeIndices.includes(idx)
                ? 'linear-gradient(180deg, #00f3ff 0%, #3B82F6 100%)' 
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
              borderColor: activeIndices.includes(idx)
                ? 'rgba(0, 243, 255, 0.5)'
                : 'rgba(255, 255, 255, 0.08)',
              boxShadow: (activeIndices.includes(idx) && !isLowIntensity)
                ? '0 0 30px rgba(0, 243, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.02)'
            }}
            transition={{
              layout: isLowIntensity ? { duration: 0.1 } : { type: "spring", stiffness: 400, damping: 35 },
              height: isLowIntensity ? { duration: 0.1 } : { type: "spring", stiffness: 400, damping: 35 },
              background: { duration: 0.3 }
            }}
            className="flex-1 rounded-t-2xl relative group cursor-crosshair border-x border-t transition-colors duration-300"
          >
            {/* Liquid Glow Effect - hidden in low intensity */}
            {activeIndices.includes(idx) && !isLowIntensity && (
              <div className="absolute inset-x-0 -bottom-20 top-0 bg-secondary/10 blur-2xl -z-10 animate-pulse"></div>
            )}
            
            {/* Data Label */}
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-mono text-secondary font-bold opacity-0 group-hover:opacity-100 transition-all bg-background/95 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-secondary/20 z-30 shadow-premium translate-y-3 group-hover:translate-y-0">
              VAL::{item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Control Actions - Professional Button Pattern */}
      <div className="mt-20 flex gap-8 items-center z-30">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 cursor-pointer flex items-center gap-4 group shadow-premium ${
            isPaused 
              ? 'btn-premium text-white scale-105' 
              : 'glass-panel text-text/40 hover:text-text hover:border-secondary/40 hover:bg-white/[0.03]'
          }`}
        >
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            isPaused 
              ? 'bg-white shadow-neon-white' 
              : `bg-secondary shadow-neon-cyan ${isLowIntensity ? '' : 'animate-pulse'} group-hover:scale-125`
          }`}></div>
          {isPaused ? 'Resume_Engine' : 'Halt_Execution'}
        </button>
        
        <button 
          onClick={() => {
            setCurrentEventIndex(-1);
            setData(initialData.map((val, idx) => ({ id: idx, value: val })));
            setActiveIndices([]);
            setDescription('');
            setActiveOp('SYSTEM_REBOOT');
          }}
          className="px-10 py-4 glass-panel rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 cursor-pointer text-text/20 hover:text-text hover:border-white/20 hover:bg-white/[0.03] shadow-premium"
        >
          Reset_Interface
        </button>
      </div>
    </div>
  );
};

