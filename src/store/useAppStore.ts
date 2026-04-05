import { create } from 'zustand';
import { FuelData } from '../services/DataPipeline';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  data: FuelData[];
  setData: (data: FuelData[]) => void;
  filters: {
    region: string | null;
    fuelType: string | null;
    maxPrice: number;
    searchQuery: string;
  };
  setFilter: (key: keyof AppState['filters'], value: any) => void;
  resetFilters: () => void;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  data: [],
  setData: (data) => set({ data }),
  filters: {
    region: null,
    fuelType: null,
    maxPrice: 6,
    searchQuery: '',
  },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { region: null, fuelType: null, maxPrice: 6, searchQuery: '' } }),
  showOnboarding: true,
  dismissOnboarding: () => set({ showOnboarding: false }),
}));
