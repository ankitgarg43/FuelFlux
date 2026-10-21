import { describe, it, expect } from 'vitest';
import { fetchGasStations, findCity, findNearestCity, getCoveredCities } from './stationService';
import { CITY_PRICES } from '../data/fuelData';

describe('stationService', () => {
  it('covers 8 cities', () => {
    expect(getCoveredCities().length).toBe(8);
    expect(getCoveredCities()).toContain('Toronto, ON');
    expect(getCoveredCities()).toContain('Seattle, WA');
  });

  it('returns Toronto rows in CAD per litre, anchored to the NRCan average', async () => {
    const rows = await fetchGasStations('Toronto, ON');
    expect(rows.length).toBeGreaterThan(10);
    expect(rows.every((r) => r.city === 'Toronto')).toBe(true);
    expect(rows.every((r) => r.currency === 'CAD' && r.unit === 'Liter')).toBe(true);

    // Stations cluster on the official city average (max offset 0.05);
    // anchor to fuelData dynamically so the weekly refresh can't break this.
    const anchor = CITY_PRICES.find((c) => c.city === 'Toronto')!.averages.Regular;
    const regular = rows.filter((r) => r.fuelType === 'Regular');
    expect(regular.length).toBe(7);
    for (const r of regular) {
      expect(Math.abs(r.price - anchor)).toBeLessThanOrEqual(0.06);
    }
  });

  it('returns Seattle rows in USD per gallon', async () => {
    const rows = await fetchGasStations('Seattle, WA');
    expect(rows.length).toBeGreaterThan(10);
    expect(rows.every((r) => r.currency === 'USD' && r.unit === 'Gallon')).toBe(true);
  });

  it('not every station sells diesel', async () => {
    const rows = await fetchGasStations('Toronto');
    const diesel = rows.filter((r) => r.fuelType === 'Diesel');
    const regular = rows.filter((r) => r.fuelType === 'Regular');
    expect(diesel.length).toBeGreaterThan(0);
    expect(diesel.length).toBeLessThan(regular.length);
  });

  it('matches by zip/postal prefix and returns [] for uncovered places', async () => {
    expect(findCity('98101')?.city).toBe('Seattle');
    expect(findCity('M4B 1B3')?.city).toBe('Toronto');
    expect(findCity('L5B 2C9')?.city).toBe('Mississauga');
    await expect(fetchGasStations('Denver, CO')).resolves.toEqual([]);
  });

  it('finds the nearest covered city from coordinates', () => {
    // Mississauga (his home turf), Seattle, and Vancouver coordinates
    expect(findNearestCity(43.589, -79.6441).info.city).toBe('Mississauga');
    expect(findNearestCity(47.6062, -122.3321).info.city).toBe('Seattle');
    expect(findNearestCity(49.2827, -123.1207).info.city).toBe('Vancouver');
    expect(findNearestCity(43.589, -79.6441).distanceKm).toBeLessThan(1);
  });

  it('coordinates win over the text query in fetchGasStations', async () => {
    const rows = await fetchGasStations('Nearby Stations', 43.589, -79.6441);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.city === 'Mississauga')).toBe(true);
  });
});
