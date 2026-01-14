import React from 'react';

interface FooterProps {
  rate: number;
  sources: string[];
}

export const Footer: React.FC<FooterProps> = ({ rate, sources }) => {
  return (
    <div className="mt-12 text-center space-y-6">
      
      {/* Live Rate Pill */}
      <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/60 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono text-zinc-400 tracking-wide flex items-center gap-2">
          <span className="text-zinc-600">FX RATE:</span> 
          <span>1 USD = <span className="font-digital text-base text-emerald-400 tracking-wider">{rate.toFixed(5)}</span> CAD</span>
        </span>
      </div>

      {sources.length > 0 && (
        <div className="text-zinc-600 max-w-md mx-auto">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest font-mono opacity-60">
            {sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>[</span>
                {new URL(source).hostname.replace('www.', '')}
                <span>]</span>
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-zinc-900 w-24 mx-auto"></div>
      
      <p className="text-[10px] text-zinc-700 max-w-xs mx-auto font-mono">
        SYSTEM: GEMINI-3-FLASH // VOL: 3.785L
      </p>
    </div>
  );
};