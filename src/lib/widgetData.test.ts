import { describe, it, expect } from 'vitest';
import { buildWidgetData } from './widgetData';

describe('buildWidgetData', () => {
  const data = buildWidgetData();

  it('covers all 8 cities with a full payload', () => {
    expect(data.cities).toHaveLength(8);
    for (const c of data.cities) {
      expect(c.prices.Regular).toBeGreaterThan(0);
      expect(c.prices.Diesel).toBeGreaterThan(0);
      expect(c.weekEnding).toBeTruthy();
      expect(c.outlook.forWeekEnding).toBeTruthy();
    }
  });

  it('formats Canadian prices in cents per litre', () => {
    const toronto = data.cities.find((c) => c.name === 'Toronto')!;
    expect(toronto.regularUnitLabel).toBe('¢/L');
    expect(toronto.regularDisplay).toBe((toronto.prices.Regular * 100).toFixed(1));
  });

  it('formats US prices in dollars per gallon', () => {
    const seattle = data.cities.find((c) => c.name === 'Seattle')!;
    expect(seattle.regularUnitLabel).toBe('$/gal');
    expect(seattle.regularDisplay).toBe(seattle.prices.Regular.toFixed(3));
  });
});
