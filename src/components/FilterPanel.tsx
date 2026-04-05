import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Filter, RefreshCw } from 'lucide-react';

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const FUEL_TYPES = ['Regular', 'Midgrade', 'Premium', 'Diesel'];

export const FilterPanel: React.FC = () => {
  const { filters, setFilter, resetFilters } = useAppStore();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
          <Filter size={18} />
          Filters
        </h2>
        <button 
          onClick={resetFilters}
          className="text-xs flex items-center gap-1 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search Station</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilter('searchQuery', e.target.value)}
              placeholder="e.g. EcoFuel"
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Region</label>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setFilter('region', filters.region === region ? null : region)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  filters.region === region 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fuel Type</label>
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilter('fuelType', filters.fuelType === type ? null : type)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  filters.fuelType === type 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Max Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Max Price</label>
            <span className="text-xs font-mono text-zinc-500">${filters.maxPrice.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="2"
            max="6"
            step="0.1"
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
