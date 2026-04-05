import { create } from 'zustand';

export type Currency = 'USD' | 'CAD' | 'EUR';
export type Unit = 'Gallon' | 'Liter';

export interface GasStationData {
  id: string;
  stationName: string;
  address: string;
  city: string;
  distance?: number;
  fuelType: string;
  price: number;
  currency: Currency;
  unit: Unit;
  timestamp: number;
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  data: GasStationData[];
  setData: (data: GasStationData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  filters: {
    fuelType: string | null;
    maxPrice: number;
    searchQuery: string;
  };
  setFilter: (key: keyof AppState['filters'], value: any) => void;
  resetFilters: () => void;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
  preferredCurrency: Currency;
  preferredUnit: Unit;
  setPreferences: (currency: Currency, unit: Unit) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  data: [],
  setData: (data) => set({ data }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
  location: null,
  setLocation: (loc) => set({ location: loc }),
  filters: {
    fuelType: null,
    maxPrice: 10,
    searchQuery: 'Seattle, WA',
  },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { fuelType: null, maxPrice: 10, searchQuery: '' } }),
  showOnboarding: true,
  dismissOnboarding: () => set({ showOnboarding: false }),
  preferredCurrency: 'USD',
  preferredUnit: 'Gallon',
  setPreferences: (currency, unit) => set({ preferredCurrency: currency, preferredUnit: unit }),
}));
