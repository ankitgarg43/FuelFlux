import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { convertPrice } from '../lib/conversion';

export const Analytics: React.FC = () => {
  const { data, filters, theme, preferredCurrency, preferredUnit } = useAppStore();

  const convertedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      convertedPrice: convertPrice(item.price, item.currency, item.unit, preferredCurrency, preferredUnit)
    }));
  }, [data, preferredCurrency, preferredUnit]);

  const filteredData = useMemo(() => {
    return convertedData.filter(item => {
      if (filters.fuelType && item.fuelType !== filters.fuelType) return false;
      if (item.convertedPrice > filters.maxPrice) return false;
      return true;
    });
  }, [convertedData, filters]);

  const chartData = useMemo(() => {
    return filteredData
      .map(item => ({
        name: item.stationName,
        price: Number(item.convertedPrice.toFixed(3)),
        distance: item.distance
      }))
      .sort((a, b) => {
        // Sort by distance if available, otherwise by price
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return a.price - b.price;
      })
      .slice(0, 15); // Show top 15
  }, [filteredData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avg: 0, min: 0, max: 0 };
    const prices = filteredData.map(d => d.convertedPrice);
    return {
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(3),
      min: Math.min(...prices).toFixed(3),
      max: Math.max(...prices).toFixed(3)
    };
  }, [filteredData]);

  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const currencySymbol = preferredCurrency === 'USD' ? '$' : preferredCurrency === 'EUR' ? '€' : 'C$';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Average Price</p>
            <p className="text-3xl font-display font-bold text-slate-900 dark:text-white text-glow">{currencySymbol}{stats.avg}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Activity size={18} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Lowest Price</p>
            <p className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400 text-glow">{currencySymbol}{stats.min}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingDown size={18} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Highest Price</p>
            <p className="text-3xl font-display font-bold text-rose-600 dark:text-rose-400 text-glow">{currencySymbol}{stats.max}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white mb-4">Price Comparison ({preferredCurrency}/{preferredUnit})</h3>
        <div className="h-[220px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  stroke={textColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                  stroke={textColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val.toFixed(3)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${currencySymbol}${value.toFixed(3)}`, 'Price']}
                />
                <Bar dataKey="price" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
              No data available to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
