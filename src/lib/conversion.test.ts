import { describe, it, expect } from 'vitest';
import { convertUnit, convertCurrency, convertPrice } from './conversion';

describe('conversion calculations', () => {
  it('converts units correctly', () => {
    // 1 Gallon = 3.78541 Liters
    expect(convertUnit(1, 'Gallon', 'Liter')).toBeCloseTo(3.78541, 3);
    expect(convertUnit(3.78541, 'Liter', 'Gallon')).toBeCloseTo(1, 3);
  });

  it('converts currencies correctly (mock rates)', () => {
    // Rates base: USD=1, CAD=1.35, EUR=0.92
    expect(convertCurrency(10, 'USD', 'CAD')).toBeCloseTo(13.5, 3);
    expect(convertCurrency(13.5, 'CAD', 'USD')).toBeCloseTo(10, 3);
    
    expect(convertCurrency(100, 'USD', 'EUR')).toBeCloseTo(92, 3);
    expect(convertCurrency(92, 'EUR', 'USD')).toBeCloseTo(100, 3);
  });

  it('converts combined price/currency/unit accurately', () => {
    // Basic conversion: $3.50 USD / Gallon
    const priceUsdGal = 3.50;
    
    // To USD / Liter
    // 3.50 USD per Gallon / 3.78541 = 0.9246 USD per Liter
    const expectedUsdLiter = 3.50 / 3.78541;
    expect(convertPrice(priceUsdGal, 'USD', 'Gallon', 'USD', 'Liter')).toBeCloseTo(expectedUsdLiter, 4);
    
    // To CAD / Liter
    // 0.9246 USD * 1.35 CAD = 1.2482 CAD per Liter
    const expectedCadLiter = expectedUsdLiter * 1.35;
    expect(convertPrice(priceUsdGal, 'USD', 'Gallon', 'CAD', 'Liter')).toBeCloseTo(expectedCadLiter, 4);
  });
});
