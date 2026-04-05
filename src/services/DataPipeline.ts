export interface FuelData {
  id: string;
  stationName: string;
  region: string;
  fuelType: 'Regular' | 'Midgrade' | 'Premium' | 'Diesel';
  price: number;
  currency: 'USD' | 'CAD';
  timestamp: number;
  trend: 'up' | 'down' | 'stable';
}

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const STATIONS = ['EcoFuel', 'SpeedyGas', 'PowerDrive', 'ValueFill', 'PremiumStop'];
const FUEL_TYPES = ['Regular', 'Midgrade', 'Premium', 'Diesel'] as const;

export class DataPipeline {
  private listeners: ((data: FuelData[]) => void)[] = [];
  private data: FuelData[] = [];
  private intervalId: any = null;

  constructor() {
    this.generateInitialData();
  }

  private generateInitialData() {
    for (let i = 0; i < 100; i++) {
      this.data.push(this.createRandomDataPoint(Date.now() - Math.random() * 3600000)); // Last hour
    }
    this.data.sort((a, b) => b.timestamp - a.timestamp);
  }

  private createRandomDataPoint(timestamp: number = Date.now()): FuelData {
    const basePrice = 3.0 + Math.random() * 2.0;
    return {
      id: Math.random().toString(36).substring(2, 9),
      stationName: STATIONS[Math.floor(Math.random() * STATIONS.length)],
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      fuelType: FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)],
      price: parseFloat(basePrice.toFixed(2)),
      currency: Math.random() > 0.5 ? 'USD' : 'CAD',
      timestamp,
      trend: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
    };
  }

  public start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      const newData = this.createRandomDataPoint();
      this.data = [newData, ...this.data].slice(0, 500);
      this.notifyListeners();
    }, 2500);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public subscribe(listener: (data: FuelData[]) => void) {
    this.listeners.push(listener);
    listener(this.data);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.data));
  }
}

export const pipeline = new DataPipeline();
