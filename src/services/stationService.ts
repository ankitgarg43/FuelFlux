import { CITY_PRICES, STATIONS, CityPriceInfo } from '../data/fuelData';
import { GasStationData } from '../store/useAppStore';

/**
 * Local station service — no API key, no external calls.
 *
 * Prices come from official weekly averages (see src/data/fuelData.ts):
 * EIA for US cities, Natural Resources Canada for Canadian cities. Each
 * station is priced at its city's average plus a small fixed spread.
 */

export function findCity(query: string): CityPriceInfo | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  // The geolocation flow searches for "Nearby Stations"; default to Seattle,
  // matching the app's original default city.
  if (q === 'nearby stations') return CITY_PRICES.find((c) => c.city === 'Seattle');
  return CITY_PRICES.find(
    (c) =>
      q.includes(c.city.toLowerCase()) ||
      c.aliases.some((a) => q.includes(a)) ||
      c.zipPrefixes.some((z) => q.startsWith(z)),
  );
}

export async function fetchGasStations(query: string): Promise<GasStationData[]> {
  const city = findCity(query);
  if (!city) return [];

  const rows: GasStationData[] = [];
  for (const station of STATIONS.filter((s) => s.city === city.city)) {
    for (const grade of station.grades) {
      rows.push({
        id: `${station.name}-${grade}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
        stationName: station.name,
        address: station.address,
        city: city.city,
        distance: station.distance,
        fuelType: grade,
        price: Number((city.averages[grade] + station.offset).toFixed(3)),
        currency: city.currency,
        unit: city.unit,
        timestamp: Date.now(),
      });
    }
  }
  return rows;
}

export function getCoveredCities(): string[] {
  return CITY_PRICES.map((c) => `${c.city}, ${c.state}`);
}

export function getSourceNote(query: string): string | null {
  const city = findCity(query);
  if (!city) return null;
  return `Prices: ${city.source}, week ending ${city.weekEnding}. Station prices vary slightly around the city average.`;
}
