import { CITY_PRICES } from '../data/fuelData';
import { PREDICTIONS } from '../data/predictions';
import type { Currency, Unit } from '../store/useAppStore';
import type { Direction } from './outlook';

/**
 * The payload behind the free embeddable widget and the public data.json
 * feed. Generated at build time by scripts/emit-data.mjs (prebuild) so the
 * widget always carries the same numbers as the app itself.
 */

export interface WidgetCity {
  name: string;
  label: string;
  currency: Currency;
  unit: Unit;
  weekEnding: string;
  source: string;
  prices: { Regular: number; Midgrade: number; Premium: number; Diesel: number };
  /** Regular price formatted the way locals read it: "5.527" or "177.1". */
  regularDisplay: string;
  /** "$/gal" for US cities, "¢/L" for Canadian cities. */
  regularUnitLabel: string;
  outlook: { direction: Direction; predictedChangePct: number; forWeekEnding: string };
}

export interface WidgetData {
  siteUrl: string;
  cities: WidgetCity[];
}

export const SITE_URL = 'https://ankitgarg43.github.io/FuelFlux/';

export function buildWidgetData(): WidgetData {
  const cities = CITY_PRICES.map((info) => {
    // The widget shows the latest published ledger call for the city
    // (the ledger is append-only, so the last entry is the current call).
    const published = [...PREDICTIONS].reverse().find((p) => p.city === info.city);
    const prediction = published ?? {
      predictedChangePct: 0,
      direction: 'Steady' as Direction,
      forWeekEnding: info.weekEnding,
    };
    const isCAD = info.currency === 'CAD';
    return {
      name: info.city,
      label: `${info.city}, ${info.state}`,
      currency: info.currency,
      unit: info.unit,
      weekEnding: info.weekEnding,
      source: info.source,
      prices: { ...info.averages },
      regularDisplay: isCAD ? (info.averages.Regular * 100).toFixed(1) : info.averages.Regular.toFixed(3),
      regularUnitLabel: isCAD ? '¢/L' : '$/gal',
      outlook: {
        direction: prediction.direction,
        predictedChangePct: prediction.predictedChangePct,
        forWeekEnding: prediction.forWeekEnding,
      },
    };
  });
  return { siteUrl: SITE_URL, cities };
}
