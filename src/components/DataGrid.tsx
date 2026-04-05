import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { MapPin, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { convertPrice } from '../lib/conversion';

type SortField = 'stationName' | 'distance' | 'fuelType' | 'price' | 'timestamp';
type SortOrder = 'asc' | 'desc';

export const DataGrid: React.FC = () => {
  const { data, filters, preferredCurrency, preferredUnit } = useAppStore();
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const convertedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      convertedPrice: convertPrice(item.price, item.currency, item.unit, preferredCurrency, preferredUnit)
    }));
  }, [data, preferredCurrency, preferredUnit]);

  const filteredAndSortedData = useMemo(() => {
    let result = convertedData.filter(item => {
      if (filters.fuelType && item.fuelType !== filters.fuelType) return false;
      if (item.convertedPrice > filters.maxPrice) return false;
      return true;
    });

    result.sort((a, b) => {
      let aVal = sortField === 'price' ? a.convertedPrice : a[sortField];
      let bVal = sortField === 'price' ? b.convertedPrice : b[sortField];
      
      // Handle undefined distances
      if (sortField === 'distance') {
        aVal = aVal ?? 999999;
        bVal = bVal ?? 999999;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result.slice(0, 50); // Show latest 50
  }, [convertedData, filters, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-400" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} className="text-emerald-500" /> : <ArrowDown size={14} className="text-emerald-500" />;
  };

  const currencySymbol = preferredCurrency === 'USD' ? '$' : preferredCurrency === 'EUR' ? '€' : 'C$';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">Search Results</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full flex items-center gap-1.5">
            {filteredAndSortedData.length} Stations Found
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('stationName')}>
                <div className="flex items-center gap-1">Station <SortIcon field="stationName" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('distance')}>
                <div className="flex items-center gap-1">Distance <SortIcon field="distance" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('fuelType')}>
                <div className="flex items-center gap-1">Type <SortIcon field="fuelType" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('price')}>
                <div className="flex items-center gap-1">Price ({preferredCurrency}/{preferredUnit}) <SortIcon field="price" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-right" onClick={() => handleSort('timestamp')}>
                <div className="flex items-center justify-end gap-1">Updated <SortIcon field="timestamp" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{item.stationName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {item.address}, {item.city}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {item.distance ? `${item.distance.toFixed(1)} mi` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                      {item.fuelType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {currencySymbol}{item.convertedPrice.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {format(item.timestamp, 'HH:mm')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No stations found. Try searching for a city or zip code.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
