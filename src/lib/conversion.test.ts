import { describe, it, expect } from 'vitest';
import { convertPrice } from './conversion';

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
});
