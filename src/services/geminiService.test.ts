import { describe, it, expect, vi } from 'vitest';
import { getFallbackData } from './geminiService';

describe('getFallbackData', () => {
  it('returns exactly 4 mock gas stations', () => {
    const data = getFallbackData('Seattle');
    expect(data.length).toBe(4);
  });

  it('incorporates the queried city into the mocked response', () => {
    const cityName = 'Olympia';
    const data = getFallbackData(cityName);
    expect(data[0].city).toBe(cityName);
    expect(data[1].city).toBe(cityName);
  });
  
  it('calculates prices around standard US baseline', () => {
    const data = getFallbackData('Anywhere');
    expect(data[0].price).toBeGreaterThan(3.0);
    expect(data[0].price).toBeLessThan(5.0);
    expect(data[0].currency).toBe('USD');
  });
});
