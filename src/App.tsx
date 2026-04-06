import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { Analytics } from './components/Analytics';
import { DataGrid } from './components/DataGrid';
import { Onboarding } from './components/Onboarding';
import { fetchGasStations, getFallbackData } from './services/geminiService';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const { theme, setData, setIsLoading, error, setError } = useAppStore();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchGasStations('Seattle, WA')
      .then(results => setData(results))
      .catch(err => {
        console.error(err);
        if (err.message === 'API_QUOTA_EXCEEDED' || err?.status === 429 || err?.message?.includes('quota')) {
          setError("API Rate Limit Exceeded. Displaying fallback data.");
          setData(getFallbackData('Seattle, WA'));
        } else {
          setError("Failed to fetch gas stations. Please try again later.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [setData, setIsLoading, setError]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="crt-scanlines min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-emerald-500/30">
      <Header />
      <Onboarding />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <FilterPanel />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <Analytics />
            <DataGrid />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;