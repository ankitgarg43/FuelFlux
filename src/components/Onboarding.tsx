import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { showOnboarding, dismissOnboarding } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!showOnboarding) return null;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
      >
        <Info size={20} />
        <span className="text-sm font-medium pr-1">Getting Started</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      <div className="bg-emerald-600 p-4 text-white relative flex-shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-lg">Welcome to FluxFuel</h2>
            <p className="text-emerald-100 text-xs mt-1">Your real-time fuel dashboard</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:bg-emerald-700 rounded transition-colors"
              aria-label="Collapse"
            >
              <ChevronDown size={16} />
            </button>
            <button 
              onClick={dismissOnboarding}
              className="p-1 hover:bg-emerald-700 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>
          <strong>1. Search:</strong> Find real-time gas prices by city or zip code.
        </p>
        <p>
          <strong>2. Convert:</strong> Use the header to switch between currencies (USD/CAD/EUR) and units (Gallons/Liters).
        </p>
        <p>
          <strong>3. Analyze:</strong> View price comparisons and trends in the analytics panel.
        </p>
        
        <button 
          onClick={dismissOnboarding}
          className="w-full mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
