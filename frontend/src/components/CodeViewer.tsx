import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { algorithmSnippets } from '../data/snippets';

interface CodeViewerProps {
  algorithm: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ algorithm }) => {
  const [language, setLanguage] = useState<'python' | 'julia' | 'rust' | 'go' | 'csharp' | 'java' | 'c' | 'cpp'>('python');

  const snippets = algorithmSnippets[algorithm] || {};
  const code = snippets[language] || '// No snippet available for this language yet.';

  const languages = [
    { id: 'python', name: 'Python', color: 'indigo' },
    { id: 'julia', name: 'Julia', color: 'cyan' },
    { id: 'rust', name: 'Rust', color: 'orange' },
    { id: 'go', name: 'Go', color: 'sky' },
    { id: 'csharp', name: 'C#', color: 'purple' },
    { id: 'java', name: 'Java', color: 'red' },
    { id: 'c', name: 'C', color: 'blue' },
    { id: 'cpp', name: 'C++', color: 'emerald' },
  ] as const;

  const getSyntaxLanguage = (lang: string) => {
    switch (lang) {
      case 'csharp': return 'csharp';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      case 'go': return 'go';
      case 'rust': return 'rust';
      case 'julia': return 'julia';
      default: return 'python';
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          Implementation Code
        </h2>
        <div className="flex flex-wrap gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                language === lang.id 
                  ? `bg-${lang.color}-600 text-white shadow-lg shadow-${lang.color}-500/20` 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/50">
        <SyntaxHighlighter
          language={getSyntaxLanguage(language)}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
          showLineNumbers={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
