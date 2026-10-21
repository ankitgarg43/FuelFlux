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
  return CITY_PRICES.find(
    (c) =>
      q.includes(c.city.toLowerCase()) ||
      c.aliases.some((a) => q.includes(a)) ||
      c.zipPrefixes.some((z) => q.startsWith(z)),
  );
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export interface NearestCity {
  info: CityPriceInfo;
  distanceKm: number;
}

/** The covered city closest to the given coordinates. */
export function findNearestCity(lat: number, lng: number): NearestCity {
  let best: NearestCity | null = null;
  for (const info of CITY_PRICES) {
    const distanceKm = haversineKm(lat, lng, info.lat, info.lng);
    if (!best || distanceKm < best.distanceKm) best = { info, distanceKm };
  }
  return best!;
}

export async function fetchGasStations(query: string, lat?: number, lng?: number): Promise<GasStationData[]> {
  // With coordinates (the Detect My Location flow), the nearest covered city
  // wins — a text query must never override where the user actually is.
  const city =
    typeof lat === 'number' && typeof lng === 'number'
      ? findNearestCity(lat, lng).info
      : findCity(query);
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
