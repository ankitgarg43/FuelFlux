import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Filter, Activity, Database } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { showOnboarding, dismissOnboarding } = useAppStore();

  if (!showOnboarding) return null;

  return (
    <div className="bg-emerald-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <button 
          onClick={dismissOnboarding}
          className="absolute top-4 right-4 p-2 hover:bg-emerald-700 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
        
        <div className="max-w-3xl">
          <h1 className="text-2xl font-display font-bold mb-2">Welcome to FuelFlux</h1>
          <p className="text-emerald-100 mb-6 text-base">
            Your real-time dashboard for monitoring fuel prices across regions. Here's how to get the most out of it:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-700/50 rounded-lg p-4 border border-emerald-500/30">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
                <Filter size={16} />
              </div>
              <h3 className="font-semibold text-sm mb-1">Intuitive Filtering</h3>
              <p className="text-xs text-emerald-100">Use the sidebar to instantly narrow down data by region, fuel type, or maximum price.</p>
            </div>
            
            <div className="bg-emerald-700/50 rounded-lg p-4 border border-emerald-500/30">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
                <Activity size={16} />
              </div>
              <h3 className="font-semibold text-sm mb-1">Intelligent Analysis</h3>
              <p className="text-xs text-emerald-100">Watch trends unfold in real-time with our dynamic charts and aggregated statistics.</p>
            </div>
            
            <div className="bg-emerald-700/50 rounded-lg p-4 border border-emerald-500/30">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
                <Database size={16} />
              </div>
              <h3 className="font-semibold text-sm mb-1">Live Data Pipeline</h3>
              <p className="text-xs text-emerald-100">Our simulated backend continuously aggregates fresh data points, ensuring you always see the latest information.</p>
            </div>
          </div>
          
          <button 
            onClick={dismissOnboarding}
            className="mt-6 bg-white text-emerald-600 px-6 py-2 rounded-full text-sm font-medium hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
