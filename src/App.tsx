import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { pipeline } from './services/DataPipeline';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { Analytics } from './components/Analytics';
import { DataGrid } from './components/DataGrid';
import { Onboarding } from './components/Onboarding';

const App: React.FC = () => {
  const { theme, setData } = useAppStore();

  useEffect(() => {
    const unsubscribe = pipeline.subscribe((data) => {
      setData([...data]);
    });
    pipeline.start();
    return () => {
      unsubscribe();
      pipeline.stop();
    };
  }, [setData]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-blue-500/30">
      <Header />
      <Onboarding />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <Analytics />
            <DataGrid />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;