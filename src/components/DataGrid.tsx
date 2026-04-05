import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export const DataGrid: React.FC = () => {
  const { data, filters } = useAppStore();

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.region && item.region !== filters.region) return false;
      if (filters.fuelType && item.fuelType !== filters.fuelType) return false;
      if (item.price > filters.maxPrice) return false;
      if (filters.searchQuery && !item.stationName.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      return true;
    }).slice(0, 50); // Show latest 50
  }, [data, filters]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Live Data Feed</h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-5 py-3 font-medium">Station</th>
              <th className="px-5 py-3 font-medium">Region</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Trend</th>
              <th className="px-5 py-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">{item.stationName}</td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{item.region}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">
                      {item.fuelType}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    ${item.price.toFixed(2)} <span className="text-xs text-zinc-500">{item.currency}</span>
                  </td>
                  <td className="px-5 py-3">
                    {item.trend === 'up' && <ArrowUpRight size={16} className="text-red-500" />}
                    {item.trend === 'down' && <ArrowDownRight size={16} className="text-green-500" />}
                    {item.trend === 'stable' && <Minus size={16} className="text-zinc-400" />}
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    {format(item.timestamp, 'HH:mm:ss')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                  No data matches your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
