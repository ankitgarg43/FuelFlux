import React from 'react';
import { GasStation } from '../types';

interface NearbyStationsProps {
  stations: GasStation[];
  loading: boolean;
  onScan: () => void;
  error?: string | null;
  hasPermission: boolean;
}

export const NearbyStations: React.FC<NearbyStationsProps> = ({ stations, loading, onScan, error, hasPermission }) => {
  return (
    <div className="w-full max-w-md md:max-w-4xl mt-6 animate-fade-in-up">
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/50 overflow-hidden relative group p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
             <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border border-zinc-700 bg-black ${loading ? 'animate-pulse' : ''}`}>
               <span className="text-lg">⛽</span>
               {loading && <div className="absolute inset-0 border-2 border-t-cyan-500 border-transparent rounded-full animate-spin"></div>}
             </div>
             <div>
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest text-shadow-sm">Fuel Radar</h3>
                <p className="text-[10px] text-zinc-500 font-mono">GEOSPATIAL LOCATOR</p>
             </div>
          </div>
          
          <button 
            onClick={onScan}
            disabled={loading}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-mono uppercase tracking-widest text-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">{loading ? 'SCANNING...' : 'SCAN NEARBY'}</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
            <div className="p-3 mb-2 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs font-mono text-center">
                {error}
            </div>
        )}

        {/* Content */}
        {!hasPermission && !loading && stations.length === 0 && !error && (
             <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-600 text-xs font-mono">ENABLE GPS TO LOCATE STATIONS</p>
             </div>
        )}

        {stations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stations.map((station, idx) => (
              <div 
                key={idx} 
                className="bg-black/40 border border-zinc-800 p-3 rounded-xl hover:border-cyan-500/50 transition-colors group/card relative overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute top-0 right-0 p-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover/card:bg-cyan-400 group-hover/card:animate-ping"></div>
                </div>
                <h4 className="text-cyan-100 font-bold text-sm truncate pr-4 text-shadow-sm">{station.name}</h4>
                <p className="text-zinc-500 text-[10px] truncate font-mono mt-1">{station.address}</p>
                <div className="mt-3 flex items-end justify-between border-t border-zinc-800/50 pt-2">
                    <span className="text-[9px] text-zinc-600 uppercase font-mono">Regular</span>
                    <span className="text-purple-400 font-digital text-xl leading-none tracking-wide text-shadow-sm">{station.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};