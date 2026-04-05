import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data, filters, theme } = useAppStore();

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.region && item.region !== filters.region) return false;
      if (filters.fuelType && item.fuelType !== filters.fuelType) return false;
      if (item.price > filters.maxPrice) return false;
      if (filters.searchQuery && !item.stationName.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [data, filters]);

  const chartData = useMemo(() => {
    // Group by minute for a smoother trend line
    const grouped = filteredData.reduce((acc, curr) => {
      const time = new Date(curr.timestamp);
      time.setSeconds(0, 0);
      const timeStr = time.getTime();
      if (!acc[timeStr]) {
        acc[timeStr] = { time: timeStr, price: 0, count: 0 };
      }
      acc[timeStr].price += curr.price;
      acc[timeStr].count += 1;
      return acc;
    }, {} as Record<number, { time: number, price: number, count: number }>);

    return Object.values(grouped)
      .map(g => ({
        time: g.time,
        avgPrice: Number((g.price / g.count).toFixed(2))
      }))
      .sort((a, b) => a.time - b.time)
      .slice(-20); // Last 20 data points
  }, [filteredData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avg: 0, min: 0, max: 0 };
    const prices = filteredData.map(d => d.price);
    return {
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
      min: Math.min(...prices).toFixed(2),
      max: Math.max(...prices).toFixed(2)
    };
  }, [filteredData]);

  const textColor = theme === 'dark' ? '#a1a1aa' : '#52525b';
  const gridColor = theme === 'dark' ? '#27272a' : '#e4e4e7';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Average Price</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">${stats.avg}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Activity size={20} />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Lowest Price</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">${stats.min}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <TrendingDown size={20} />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Highest Price</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">${stats.max}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-6">Price Trend Analysis</h3>
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(tick) => format(tick, 'HH:mm')} 
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val.toFixed(2)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                  labelFormatter={(label) => format(label, 'MMM dd, HH:mm:ss')}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Avg Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
              Not enough data to display trends.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
