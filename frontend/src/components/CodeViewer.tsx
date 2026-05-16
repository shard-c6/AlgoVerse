import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { algorithmSnippets } from '../data/snippets';
import { Code2, Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  algorithm: string;
  isLowIntensity?: boolean;
  highlightedLine?: number;
  selectedLanguage?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ algorithm, isLowIntensity, highlightedLine, selectedLanguage }) => {
  const [language, setLanguage] = useState<string>('python');

  useEffect(() => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { id: 'python', name: 'Python' },
    { id: 'julia', name: 'Julia' },
    { id: 'cpp', name: 'C++' },
    { id: 'c', name: 'C' },
    { id: 'csharp', name: 'C#' },
    { id: 'java', name: 'Java' },
    { id: 'rust', name: 'Rust' },
    { id: 'go', name: 'Go' },
  ];

  const getSyntaxLanguage = (lang: string) => {
    switch (lang) {
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'csharp': return 'csharp';
      case 'java': return 'java';
      case 'rust': return 'rust';
      case 'go': return 'go';
      case 'julia': return 'julia';
      default: return 'python';
    }
  };

  const code = algorithmSnippets[algorithm]?.[language] || '// No snippet available';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (highlightedLine && scrollContainerRef.current) {
      const highlightedElement = scrollContainerRef.current.querySelector(`[data-line-number="${highlightedLine}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [highlightedLine]);

  const cyberpunkNight = {
    ...vscDarkPlus,
    'keyword': { color: 'var(--color-secondary)' }, // Cyan
    'function': { color: 'var(--color-accent)' }, // Magenta
    'string': { color: '#39ff14' }, // Neon Green
    'comment': { color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' },
    'number': { color: 'var(--color-secondary)' },
    'operator': { color: 'rgba(255,255,255,0.6)' },
    'class-name': { color: 'var(--color-secondary)', textDecoration: 'underline' },
    'boolean': { color: 'var(--color-accent)' },
    'property': { color: 'var(--color-secondary)' },
    'attr-name': { color: 'var(--color-secondary)' },
    'builtin': { color: 'var(--color-accent)' },
  };

  return (
    <div className={`glass-panel rounded-[2.5rem] p-6 lg:p-10 h-full flex flex-col relative overflow-hidden group hud-corners hud-corners-tl hud-corners-br ${isLowIntensity ? '' : 'scanlines'}`}>
      <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6 mb-8 lg:mb-10 relative z-10">
        <div className="space-y-1">
          <h2 className="text-xs lg:text-sm font-bold text-text flex items-center gap-3 font-mono tracking-[0.2em] uppercase">
            <Code2 className="text-secondary neon-glow-cyan shrink-0" size={18} />
            Implementation_Source
          </h2>
          <p className="text-[9px] font-mono text-text/20 uppercase tracking-[0.1em]">Protocol: {algorithm.toUpperCase()}_v1.0</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={copyToClipboard}
            className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-text/40 hover:text-secondary hover:border-secondary/30 transition-all cursor-pointer group/copy"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="group-hover/copy:scale-110 transition-transform" />}
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 lg:px-5 lg:py-2.5 bg-background/50 rounded-full border border-white/5 backdrop-blur-md">
            <div className={`w-1.5 h-1.5 rounded-full bg-secondary shadow-neon-cyan ${isLowIntensity ? '' : 'animate-pulse'}`} />
            <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.3em]">IDE_Engine_Active</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 lg:mb-8 relative z-10 p-1.5 glass-card rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              language === lang.id 
                ? `bg-secondary/10 text-secondary border border-secondary/30 shadow-neon-cyan/10` 
                : 'text-text/30 hover:text-text/60 hover:bg-white/5 border border-transparent'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
      
      <div className="flex-grow overflow-hidden rounded-3xl border border-white/5 glass-card relative z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30"></div>
          </div>
          <div className="text-[9px] font-mono text-text/20 uppercase tracking-[0.2em] font-bold">
            {language}.{getSyntaxLanguage(language)}
          </div>
        </div>
        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-auto custom-scrollbar bg-background/20"
        >
          <SyntaxHighlighter
            language={getSyntaxLanguage(language)}
            style={cyberpunkNight as any}
            customStyle={{
              margin: 0,
              padding: '2rem',
              background: 'transparent',
              fontSize: '0.8rem',
              lineHeight: '1.7',
              fontFamily: 'var(--font-mono)',
            }}
            showLineNumbers={true}
            lineNumberStyle={{ minWidth: '3em', paddingRight: '1.5em', color: 'rgba(255,255,255,0.1)', textAlign: 'right', userSelect: 'none' }}
            wrapLines={true}
            lineProps={(lineNumber) => {
              const isActive = lineNumber === highlightedLine;
              return {
                style: { 
                  display: 'block', 
                  width: '100%',
                  backgroundColor: isActive ? 'rgba(0, 243, 255, 0.05)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-secondary)' : '2px solid transparent',
                  transition: 'all 200ms ease-in-out',
                },
                'data-line-number': lineNumber,
                className: isActive ? 'code-line-active' : 'code-line-highlight',
              };
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
      
      {/* HUD Background Decorations */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/[0.03] blur-[120px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default CodeViewer;
