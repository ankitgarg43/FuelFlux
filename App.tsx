import React, { useState, useEffect, useCallback } from 'react';
import { fetchCurrentExchangeRate, fetchNearbyGasStations } from './services/geminiService';
import { ConversionInput } from './components/ConversionInput';
import { Footer } from './components/Footer';
import { HistoryPanel } from './components/HistoryPanel';
import { NearbyStations } from './components/NearbyStations';
import { HistoryItem, GasStation } from './types';

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

  // State for Stations
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(false);
  const [stationError, setStationError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

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
        // Prevent saving duplicates
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
          sourceCurrency: lastEdited || 'USD',
        };

        const updatedHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        saveHistoryToStorage(updatedHistory);
        return updatedHistory;
      });
    }, 1500); 

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

  const convertUsdToCad = useCallback((usd: number, rate: number) => {
    return (usd / LITRES_PER_GALLON) * rate;
  }, []);

  const convertCadToUsd = useCallback((cad: number, rate: number) => {
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

  const scanForStations = () => {
    if (!navigator.geolocation) {
      setStationError("Geolocation not supported by your browser.");
      return;
    }

    setLoadingStations(true);
    setStationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationPermission(true);
        const { latitude, longitude } = position.coords;
        const result = await fetchNearbyGasStations(latitude, longitude);
        setStations(result.stations);
        if (result.stations.length === 0) {
            setStationError("No stations found nearby.");
        }
        setLoadingStations(false);
      },
      (error) => {
        setLoadingStations(false);
        setStationError("Location access denied or unavailable.");
        console.error(error);
      }
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-cyan-500/30 relative overflow-x-hidden scanline-container">
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float-slow { animation: float 15s ease-in-out infinite; }
        .animate-float-delayed { animation: float 18s ease-in-out infinite reverse; }
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(39, 39, 42, 0.5) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(39, 39, 42, 0.5) 1px, transparent 1px);
        }
        .text-shadow-sm { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
        .text-shadow-glow-cyan { text-shadow: 0 0 15px rgba(34,211,238,0.6); }
        .text-shadow-glow-purple { text-shadow: 0 0 15px rgba(192,132,252,0.6); }
      `}</style>

      {/* Grid Texture */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] animate-float-slow mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[100px] animate-float-delayed mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative px-8 py-5 bg-zinc-950 ring-1 ring-zinc-800 rounded-xl leading-none flex items-center space-x-4">
               <span className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse">⚡</span>
               <div className="flex flex-col items-start">
                 <span className="text-4xl font-black tracking-tighter text-white font-sans text-shadow-sm">
                   FUEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">FLUX</span>
                 </span>
               </div>
            </div>
          </div>
          <p className="mt-4 text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] font-bold">Cross-Border Kinetic Converter</p>
        </div>

        {/* Main Interface Card */}
        <div className="w-full max-w-md md:max-w-4xl bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-black border border-zinc-800/50 p-6 md:p-12 relative overflow-hidden transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_20px_#a855f7]"></div>
                </div>
              </div>
              <p className="text-sm text-cyan-500/80 animate-pulse font-mono tracking-widest uppercase font-bold">Initializing Neural Link...</p>
            </div>
          ) : (
            <div className="space-y-10 relative z-10">
              
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                
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

                <div className="relative z-20 shrink-0">
                  <div className="relative bg-zinc-950 p-4 rounded-full border border-zinc-800 shadow-xl shadow-black group">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-8 w-8 text-zinc-500 transition-all duration-500 md:-rotate-90 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  </div>
                </div>

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
              
              {usdPrice && cadPrice && exchangeRate && (
                 <div className="mt-10 relative group animate-fade-in-up">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                   <div className="relative px-8 py-6 bg-zinc-950 rounded-xl border border-zinc-800/80 flex flex-col items-center">
                     
                     <div className="flex w-full items-start justify-center">
                       <div className="text-center">
                         <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2 font-bold">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Parity Check Verified
                         </div>
                         <div className="flex items-baseline justify-center space-x-6 text-2xl md:text-5xl font-digital tracking-wide -skew-x-6">
                            <span className="text-cyan-400 font-normal text-shadow-glow-cyan">${usdPrice}</span>
                            <span className="text-zinc-600 text-sm font-mono not-italic skew-x-0 font-bold">USD</span>
                            <span className="text-zinc-400 font-mono not-italic skew-x-0 text-3xl">≈</span>
                            <span className="text-purple-400 font-normal text-shadow-glow-purple">${cadPrice}</span>
                            <span className="text-zinc-600 text-sm font-mono not-italic skew-x-0 font-bold">CAD</span>
                         </div>
                       </div>
                     </div>

                   </div>
                 </div>
              )}

            </div>
          )}
        </div>

        {/* Nearby Stations */}
        <NearbyStations 
            stations={stations} 
            loading={loadingStations} 
            onScan={scanForStations}
            error={stationError}
            hasPermission={locationPermission}
        />
        
        {/* History Panel */}
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