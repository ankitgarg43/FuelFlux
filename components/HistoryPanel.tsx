import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, onDeleteItem }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 w-full animate-fade-in-up">
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/50 overflow-hidden relative group">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-900/80 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest text-shadow-sm">Data Log (Last 15)</span>
          </div>
          <button 
            onClick={onClear}
            className="text-[10px] text-zinc-600 hover:text-red-400 uppercase tracking-wider font-bold font-mono transition-colors"
          >
            Clear Buffer
          </button>
        </div>

        {/* List */}
        <div className="p-2 space-y-1">
          {history.map((item) => {
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const isSourceUsd = item.sourceCurrency === 'USD';
            
            return (
              <div 
                key={item.id}
                className="group/item relative flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/40 transition-colors border border-transparent hover:border-zinc-800"
              >
                {/* Time & Date */}
                <div className="flex flex-col w-20 text-[10px] font-mono text-zinc-500 border-r border-zinc-800/50 mr-4 leading-tight font-medium">
                  <span className="text-zinc-400">{dateStr}</span>
                  <span>{timeStr}</span>
                </div>

                {/* Data - Directional Rendering */}
                <div className="flex-1 flex items-center justify-between font-mono text-sm">
                  {/* Left Side (Source) */}
                  <div className="flex items-center space-x-2 min-w-[35%]">
                    <span className={`font-digital text-2xl -skew-x-6 tracking-wide text-shadow-sm ${isSourceUsd ? 'text-cyan-400' : 'text-purple-400'}`}>
                      ${isSourceUsd ? item.usd : item.cad}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-bold">{isSourceUsd ? 'USD' : 'CAD'}</span>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-zinc-700 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>

                  {/* Right Side (Target) */}
                  <div className="flex items-center justify-end space-x-2 min-w-[35%]">
                     <span className={`font-digital text-2xl -skew-x-6 tracking-wide text-shadow-sm ${isSourceUsd ? 'text-purple-400' : 'text-cyan-400'}`}>
                      ${isSourceUsd ? item.cad : item.usd}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-bold">{isSourceUsd ? 'CAD' : 'USD'}</span>
                  </div>
                </div>

                {/* Delete Action */}
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="ml-4 opacity-0 group-hover/item:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                  aria-label="Delete item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};