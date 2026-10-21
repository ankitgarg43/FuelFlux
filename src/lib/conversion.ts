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

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  CAD: 'CA$',
  EUR: '€',
};

/**
 * Renders a city's price in the user's preferred currency and unit.
 * When the preference matches the city's native format, keep the local
 * pump convention instead ($X.XXX/gal in the US, XXX.X¢/L in Canada).
 */
export function formatCityPrice(
  price: number,
  nativeCurrency: Currency,
  nativeUnit: Unit,
  prefCurrency: Currency,
  prefUnit: Unit
): string {
  if (prefCurrency === nativeCurrency && prefUnit === nativeUnit) {
    return nativeCurrency === 'CAD'
      ? `${(price * 100).toFixed(1)}¢/L`
      : `$${price.toFixed(3)}/gal`;
  }
  const converted = convertPrice(price, nativeCurrency, nativeUnit, prefCurrency, prefUnit);
  return `${CURRENCY_SYMBOLS[prefCurrency]}${converted.toFixed(2)}${prefUnit === 'Gallon' ? '/gal' : '/L'}`;
}
