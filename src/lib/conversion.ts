import { Currency, Unit } from '../store/useAppStore';

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  CAD: 1.35,
  EUR: 0.92,
};

const LITERS_PER_GALLON = 3.78541;

export function convertPrice(
  price: number,
  fromCurrency: Currency,
  fromUnit: Unit,
  toCurrency: Currency,
  toUnit: Unit
): number {
  // 1. Convert to USD
  const priceInUSD = price / EXCHANGE_RATES[fromCurrency];
  
  // 2. Convert to per Liter (base unit for calculation)
  const priceInUSDPerLiter = fromUnit === 'Gallon' ? priceInUSD / LITERS_PER_GALLON : priceInUSD;
  
  // 3. Convert to target unit
  const priceInTargetUnitUSD = toUnit === 'Gallon' ? priceInUSDPerLiter * LITERS_PER_GALLON : priceInUSDPerLiter;
  
  // 4. Convert to target currency
  return priceInTargetUnitUSD * EXCHANGE_RATES[toCurrency];
}
