export interface ExchangeRateResponse {
  rate: number;
  sources: string[];
}

export enum Currency {
  USD = 'USD',
  CAD = 'CAD'
}

export interface ConversionState {
  usdPerGallon: string;
  cadPerLitre: string;
}

export interface GroundingSource {
    title?: string;
    uri?: string;
}

export interface HistoryItem {
  id: string;
  usd: string;
  cad: string;
  timestamp: number;
  sourceCurrency: 'USD' | 'CAD';
}