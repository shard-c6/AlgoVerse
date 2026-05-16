import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { type AlgorithmEvent, EventCategory } from '../types';

interface SortingVisualizerProps {
  initialData: number[];
  events: AlgorithmEvent[];
  onComplete?: () => void;
}

export const SortingVisualizer = ({ initialData, events, onComplete }: SortingVisualizerProps) => {
  const [data, setData] = useState<number[]>(initialData);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxVal = Math.max(...initialData, 1);

  useEffect(() => {
    setData(initialData);
    setCurrentEventIndex(-1);
    setActiveIndices([]);
  }, [initialData]);

  useEffect(() => {
    if (currentEventIndex < events.length - 1 && !isPaused) {
      timerRef.current = setTimeout(() => {
        const nextIndex = currentEventIndex + 1;
        const event = events[nextIndex];
        processEvent(event);
        setCurrentEventIndex(nextIndex);
      }, 100); // Animation speed
    } else if (currentEventIndex === events.length - 1) {
      setActiveIndices([]);
      if (onComplete) onComplete();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentEventIndex, events, isPaused]);

  const [description, setDescription] = useState<string>('');

  const processEvent = (event: AlgorithmEvent) => {
    if (event.description) {
      setDescription(event.description);
    }

    if (event.category === EventCategory.INITIAL) {
      if (event.values) setData([...event.values]);
      setActiveIndices([]);
    } else if (event.category === EventCategory.FINAL) {
      if (event.values) setData([...event.values]);
      setActiveIndices([]);
    } else if (event.category === EventCategory.COMPARISON) {
      setActiveIndices(event.indices || []);
    } else if (event.category === EventCategory.ARRAY_MUTATION) {
      setActiveIndices(event.indices || []);
      if (event.indices && event.values) {
        const newData = [...data];
        event.indices.forEach((idx, i) => {
          newData[idx] = event.values![i];
        });
        setData(newData);
      }
    }
  };


  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex items-end justify-center gap-1 w-full h-48 px-4">
        {data.map((val, idx) => (
          <motion.div
            key={idx}
            layout
            initial={false}
            animate={{
              height: `${(val / maxVal) * 100}%`,
              backgroundColor: activeIndices.includes(idx) || activeIndices.includes(idx + 1) // Rough highlight
                ? '#6366f1' // indigo-500
                : '#27272a', // zinc-800
            }}
            className="flex-1 rounded-t-sm relative group"
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {val}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="h-12 flex items-center justify-center text-center px-4 mb-4">
        <p className="text-sm font-medium text-zinc-300">
          {description || 'Ready to visualize...'}
        </p>
      </div>

      <div className="mt-8 flex gap-4 items-center">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button 
          onClick={() => {
            setCurrentEventIndex(-1);
            setData(initialData);
            setActiveIndices([]);
            setDescription('');
          }}
          className="px-4 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors"
        >
          Reset
        </button>
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          Step {currentEventIndex + 1} / {events.length}
        </div>
      </div>
    </div>
  );
};
