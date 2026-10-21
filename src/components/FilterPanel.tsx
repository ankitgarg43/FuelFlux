import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Filter, RefreshCw, MapPin, Loader2 } from 'lucide-react';
import { fetchGasStations, getCoveredCities } from '../services/stationService';

const FUEL_TYPES = ['Regular', 'Midgrade', 'Premium', 'Diesel'];

export const FilterPanel: React.FC = () => {
  const { filters, setFilter, resetFilters, preferredCurrency, setLocation, location, setIsLoading, setData, isLoading, setError } = useAppStore();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!filters.searchQuery.trim() && !location) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchGasStations(filters.searchQuery);
      setData(results);
      if (results.length === 0) {
        setError(`No price data for "${filters.searchQuery}" yet. Covered cities: ${getCoveredCities().join(' · ')}.`);
      }
    } catch (error: any) {
      console.error("Failed to fetch stations", error);
      setError("Failed to fetch gas stations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          setFilter('searchQuery', 'Nearby Stations');
          
          fetchGasStations('Nearby Stations')
            .then(results => setData(results))
            .catch(err => {
              console.error(err);
              setError("Failed to fetch nearby gas stations.");
            })
            .finally(() => setIsLoading(false));
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Failed to detect location. Please check your permissions.");
          setIsLoading(false);
        }
      );
    }
  };

  const handleReset = () => {
    resetFilters();
    setLocation(null);
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm" aria-label="Filters and Search Panel" role="search">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-display font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Filter size={16} aria-hidden="true" />
          Filters & Search
        </h2>
        <button 
          onClick={handleReset}
          aria-label="Reset all filters"
          className="text-xs flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <RefreshCw size={12} aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {/* Search */}
        <div className="space-y-2">
          <label htmlFor="locationSearch" className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Location Search</label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} aria-hidden="true" />
              <input
                id="locationSearch"
                aria-label="Search by city or zip code"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilter('searchQuery', e.target.value)}
                placeholder="e.g. Seattle, WA"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white transition-all font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? "Searching" : "Search for locations"}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[70px]"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : 'Search'}
            </button>
          </form>
          <button 
            type="button"
            onClick={handleDetectLocation}
            disabled={isLoading}
            aria-label="Detect my current location"
            className="w-full mt-1.5 flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <MapPin size={14} aria-hidden="true" />
            Detect My Location
          </button>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2" role="group" aria-label="Filter by Fuel Type">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Fuel Type</label>
          <div className="flex flex-wrap gap-1.5">
            {FUEL_TYPES.map(type => (
              <button
                key={type}
                aria-pressed={filters.fuelType === type}
                onClick={() => setFilter('fuelType', filters.fuelType === type ? null : type)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filters.fuelType === type 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            <label htmlFor="maxPriceSlider" className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Max Price</label>
            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 text-glow" aria-live="polite">
              {preferredCurrency} {filters.maxPrice.toFixed(2)}
            </span>
          </div>
          <input
            id="maxPriceSlider"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', parseFloat(e.target.value))}
            aria-valuemin={0.5}
            aria-valuemax={10}
            aria-valuenow={filters.maxPrice}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};
