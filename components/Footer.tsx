import React from 'react';

interface FooterProps {
  rate: number;
  sources: string[];
}

export const Footer: React.FC<FooterProps> = ({ rate, sources }) => {
  return (
    <div className="mt-16 text-center space-y-8 pb-10">
      
      {/* Live Rate Pill */}
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/60 shadow-lg group hover:border-emerald-500/30 transition-colors">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-mono text-zinc-400 tracking-wide flex items-center gap-2">
          <span className="text-zinc-500 font-bold text-[10px] uppercase">FX RATE</span> 
          <span>1 USD = <span className="font-digital text-xl text-emerald-400 tracking-wider text-shadow-sm">{rate.toFixed(5)}</span> CAD</span>
        </span>
      </div>

      {sources.length > 0 && (
        <div className="text-zinc-600 max-w-md mx-auto">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-widest font-mono opacity-70">
            {sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1 group/link"
              >
                <span className="text-zinc-700 group-hover/link:text-cyan-600">[</span>
                <span className="font-bold">{new URL(source).hostname.replace('www.', '')}</span>
                <span className="text-zinc-700 group-hover/link:text-cyan-600">]</span>
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-zinc-900 w-32 mx-auto"></div>
      
      <p className="text-[11px] text-zinc-700 max-w-xs mx-auto font-mono font-medium">
        SYSTEM: GEMINI-3-FLASH // VOL: 3.785L
      </p>
    </div>
  );
};