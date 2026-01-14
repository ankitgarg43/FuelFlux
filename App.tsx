import React, { useState, useEffect, useCallback } from 'react';
import { fetchCurrentExchangeRate } from './services/geminiService';
import { ConversionInput } from './components/ConversionInput';
import { Footer } from './components/Footer';
import { HistoryPanel } from './components/HistoryPanel';
import { HistoryItem } from './types';

// Constants
const LITRES_PER_GALLON = 3.78541;
const MAX_HISTORY_ITEMS = 15;

const App: React.FC = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for inputs
  const [usdPrice, setUsdPrice] = useState<string>("");
  const [cadPrice, setCadPrice] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<'USD' | 'CAD' | null>(null);

  // State for history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const data = await fetchCurrentExchangeRate();
      setExchangeRate(data.rate);
      setSources(data.sources);
      setLoading(false);
      
      // Load history from local storage
      const savedHistory = localStorage.getItem('fuelFluxHistory');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveHistoryToStorage = (items: HistoryItem[]) => {
    localStorage.setItem('fuelFluxHistory', JSON.stringify(items));
  };

  // Auto-save history with debounce
  useEffect(() => {
    if (!usdPrice || !cadPrice) return;

    const timer = setTimeout(() => {
      setHistory((prevHistory) => {
        // Prevent saving duplicates (check if the latest entry is identical)
        if (prevHistory.length > 0) {
          const latest = prevHistory[0];
          if (latest.usd === usdPrice && latest.cad === cadPrice) {
            return prevHistory;
          }
        }

        const newItem: HistoryItem = {
          id: Date.now().toString(),
          usd: usdPrice,
          cad: cadPrice,
          timestamp: Date.now(),
          sourceCurrency: lastEdited || 'USD', // Default to USD if null, though usually set
        };

        const updatedHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        saveHistoryToStorage(updatedHistory);
        return updatedHistory;
      });
    }, 1500); // Wait 1.5 seconds after typing stops

    return () => clearTimeout(timer);
  }, [usdPrice, cadPrice, lastEdited]);

  const clearHistory = () => {
    setHistory([]);
    saveHistoryToStorage([]);
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  };

  // Recalculate when rate changes or values change
  const convertUsdToCad = useCallback((usd: number, rate: number) => {
    // Formula: (USD/Gal / 3.78541) * Rate = CAD/L
    return (usd / LITRES_PER_GALLON) * rate;
  }, []);

  const convertCadToUsd = useCallback((cad: number, rate: number) => {
    // Formula: (CAD/L * 3.78541) / Rate = USD/Gal
    return (cad * LITRES_PER_GALLON) / rate;
  }, []);

  const handleUsdChange = (val: string) => {
    setUsdPrice(val);
    setLastEdited('USD');
    if (val === '' || !exchangeRate) {
      setCadPrice('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const converted = convertUsdToCad(num, exchangeRate);
      setCadPrice(converted.toFixed(4));
    }
  };

  const handleCadChange = (val: string) => {
    setCadPrice(val);
    setLastEdited('CAD');
    if (val === '' || !exchangeRate) {
      setUsdPrice('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const converted = convertCadToUsd(num, exchangeRate);
      setUsdPrice(converted.toFixed(4));
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-cyan-500/30 relative overflow-x-hidden">
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
        .animate-float-slow { animation: float 15s ease-in-out infinite; }
        .animate-float-delayed { animation: float 18s ease-in-out infinite reverse; }
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(39, 39, 42, 0.5) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(39, 39, 42, 0.5) 1px, transparent 1px);
        }
      `}</style>

      {/* Grid Texture */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[100px] animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative px-8 py-4 bg-zinc-950 ring-1 ring-zinc-800 rounded-xl leading-none flex items-center space-x-4">
               <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">⚡</span>
               <div className="flex flex-col items-start">
                 <span className="text-3xl font-black tracking-tighter text-white font-sans">
                   FUEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">FLUX</span>
                 </span>
               </div>
            </div>
          </div>
          <p className="mt-4 text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Cross-Border Kinetic Converter</p>
        </div>

        {/* Main Interface Card - Max width adjusts based on layout */}
        <div className="w-full max-w-md md:max-w-4xl bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-black border border-zinc-800/50 p-6 md:p-10 relative overflow-hidden transition-all duration-500">
          {/* Subtle sheen reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]"></div>
                </div>
              </div>
              <p className="text-xs text-cyan-500/80 animate-pulse font-mono tracking-widest uppercase">Initializing Neural Link...</p>
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              
              {/* Inputs Container: Flex Column on Mobile, Flex Row on Desktop */}
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                
                {/* USD Input */}
                <div className="w-full md:flex-1">
                  <ConversionInput
                    label="UNITED STATES"
                    subLabel="USD / Gallon"
                    icon="🇺🇸"
                    prefix="$"
                    value={usdPrice}
                    onChange={handleUsdChange}
                    active={lastEdited === 'USD'}
                    accentColor="cyan"
                  />
                </div>

                {/* Connector Arrow */}
                <div className="relative z-20 shrink-0">
                  <div className="relative bg-zinc-950 p-3 rounded-full border border-zinc-800 shadow-xl shadow-black">
                    {/* Rotates -90deg on md screens to point right. Default points down. */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-zinc-500 transition-transform duration-500 md:-rotate-90" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  </div>
                </div>

                {/* CAD Input */}
                <div className="w-full md:flex-1">
                  <ConversionInput
                    label="CANADA"
                    subLabel="CAD / Litre"
                    icon="🇨🇦"
                    prefix="$"
                    value={cadPrice}
                    onChange={handleCadChange}
                    active={lastEdited === 'CAD'}
                    accentColor="purple"
                  />
                </div>

              </div>
              
              {/* Result Display */}
              {usdPrice && cadPrice && exchangeRate && (
                 <div className="mt-8 relative group animate-fade-in-up">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                   <div className="relative px-5 py-4 bg-zinc-950 rounded-xl border border-zinc-800/80 flex flex-col items-center">
                     
                     <div className="flex w-full items-start justify-center">
                       <div className="text-center">
                         <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Parity Check
                         </div>
                         <div className="flex items-baseline justify-center space-x-3 text-lg md:text-3xl font-digital tracking-wide -skew-x-6">
                            <span className="text-cyan-400 font-normal drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">${usdPrice}</span>
                            <span className="text-zinc-600 text-sm font-mono not-italic skew-x-0">USD</span>
                            <span className="text-zinc-400 font-mono not-italic skew-x-0">≈</span>
                            <span className="text-purple-400 font-normal drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">${cadPrice}</span>
                            <span className="text-zinc-600 text-sm font-mono not-italic skew-x-0">CAD</span>
                         </div>
                       </div>
                     </div>

                   </div>
                 </div>
              )}

            </div>
          )}
        </div>
        
        {/* History Panel - Constrain width to match inputs on mobile, wider on desktop */}
        <div className="w-full max-w-md md:max-w-4xl">
           <HistoryPanel 
            history={history} 
            onClear={clearHistory} 
            onDeleteItem={deleteHistoryItem} 
          />
        </div>

        {/* Footer Info */}
        {!loading && exchangeRate && (
          <Footer rate={exchangeRate} sources={sources} />
        )}

      </div>
    </div>
  );
};

export default App;