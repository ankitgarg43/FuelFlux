import { describe, it, expect } from 'vitest';
import { convertPrice, formatCityPrice } from './conversion';

describe('conversion calculations', () => {
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

  it('is identity when converting to the same currency and unit', () => {
    expect(convertPrice(4.199, 'CAD', 'Liter', 'CAD', 'Liter')).toBeCloseTo(4.199, 6);
    expect(convertPrice(3.5, 'USD', 'Gallon', 'USD', 'Gallon')).toBeCloseTo(3.5, 6);
  });

  it('formatCityPrice keeps the native pump format when the preference matches', () => {
    expect(formatCityPrice(5.527, 'USD', 'Gallon', 'USD', 'Gallon')).toBe('$5.527/gal');
    expect(formatCityPrice(1.771, 'CAD', 'Liter', 'CAD', 'Liter')).toBe('177.1¢/L');
  });

  it('formatCityPrice converts when the preference differs', () => {
    // Toronto 1.771 CAD/L shown to a USD/gallon user
    expect(formatCityPrice(1.771, 'CAD', 'Liter', 'USD', 'Gallon')).toBe('$4.97/gal');
    // Seattle 5.527 USD/gal shown to a CAD/litre user
    expect(formatCityPrice(5.527, 'USD', 'Gallon', 'CAD', 'Liter')).toBe('CA$1.97/L');
    // Seattle shown to a EUR/litre user
    expect(formatCityPrice(5.527, 'USD', 'Gallon', 'EUR', 'Liter')).toBe('€1.34/L');
  });
});
