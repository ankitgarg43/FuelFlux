import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Comment {
  id: string;
  productId: string;
  text: string;
  author: string;
  timestamp: number;
}

export interface Rating {
  productId: string;
  score: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  imageSeed: string;
  description: string;
}

export interface ProductAnalysis {
  productId: string;
  pros: string[];
  cons: string[];
  sentiment: string;
  aggregatedRating: number;
  sourcesScraped: number;
}

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  history: Product[];
  addToHistory: (product: Product) => void;
  clearHistory: () => void;
  
  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  
  ratings: Rating[];
  setRating: (productId: string, score: number) => void;
  getRating: (productId: string) => number | null;
  
  cachedAnalyses: Record<string, ProductAnalysis>;
  cacheAnalysis: (productId: string, analysis: ProductAnalysis) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      history: [],
      addToHistory: (product) => set((state) => {
        const filtered = state.history.filter(p => p.id !== product.id);
        return { history: [product, ...filtered].slice(0, 10) };
      }),
      clearHistory: () => set({ history: [] }),
      
      comments: [],
      addComment: (comment) => set((state) => ({
        comments: [
          ...state.comments,
          { ...comment, id: Math.random().toString(36).substring(2, 9), timestamp: Date.now() }
        ]
      })),
      
      ratings: [],
      setRating: (productId, score) => set((state) => {
        const filtered = state.ratings.filter(r => r.productId !== productId);
        return { ratings: [...filtered, { productId, score }] };
      }),
      getRating: (productId) => {
        const rating = get().ratings.find(r => r.productId === productId);
        return rating ? rating.score : null;
      },
      
      cachedAnalyses: {},
      cacheAnalysis: (productId, analysis) => set((state) => ({
        cachedAnalyses: { ...state.cachedAnalyses, [productId]: analysis }
      }))
    }),
    {
      name: 'product-analyzer-storage',
    }
  )
);
