import React from 'react';
import { Moon, Sun, Fuel } from 'lucide-react';
import { useAppStore, Currency, Unit } from '../store/useAppStore';

export const Header: React.FC = () => {
  const { theme, toggleTheme, preferredCurrency, preferredUnit, setPreferences } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
            <Fuel size={18} />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
            FuelFlux
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2 md:mr-4 border-r border-slate-200 dark:border-slate-800 pr-4">
            <select 
              value={preferredCurrency}
              onChange={(e) => setPreferences(e.target.value as Currency, preferredUnit)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="EUR">EUR</option>
            </select>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <select 
              value={preferredUnit}
              onChange={(e) => setPreferences(preferredCurrency, e.target.value as Unit)}
              className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Gallon">Gal</option>
              <option value="Liter">L</option>
            </select>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
