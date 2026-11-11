/**
 * Weekly price history — the raw material for Gas Weather (see src/lib/outlook.ts).
 *
 * One snapshot per city per week, Regular grade, in the city's native unit.
 * New snapshots are appended as part of the weekly data refresh (the same
 * edit that updates averages in fuelData.ts). Never edit a past snapshot:
 * the public prediction ledger is graded against these numbers.
 *
 * Sources:
 * - Oct 19, 2026: EIA weekly retail survey (US) / NRCan weekly averages (CA),
 *   same values as fuelData.ts.
 * - Sep 21, 2026 (US cities only): derived from FuelWide's EIA-based weekly
 *   table (cost of 100 miles at 25 mpg = 4 gallons; price = cost / 4),
 *   cross-checked against the Oct 19 EIA city values.
 * - Canadian cities: verified history starts Oct 19, 2026. NRCan does not
 *   publish a clean weekly archive by city, so earlier weeks are not
 *   backfilled rather than guessed.
 */
export interface HistorySnapshot {
  city: string;
  weekEnding: string; // e.g. 'Oct 19, 2026'
  regular: number; // native unit (USD/gallon or CAD/litre)
}

export const HISTORY: HistorySnapshot[] = [
  // Week ending Sep 21, 2026 — US cities (EIA via FuelWide, see header)
  { city: 'Seattle', weekEnding: 'Sep 21, 2026', regular: 5.693 },
  { city: 'New York', weekEnding: 'Sep 21, 2026', regular: 4.408 },
  { city: 'Los Angeles', weekEnding: 'Sep 21, 2026', regular: 5.985 },
  { city: 'Chicago', weekEnding: 'Sep 21, 2026', regular: 4.88 },
  { city: 'Houston', weekEnding: 'Sep 21, 2026', regular: 3.863 },

  // Week ending Oct 19, 2026 — all cities (EIA / NRCan, = fuelData.ts)
  { city: 'Seattle', weekEnding: 'Oct 19, 2026', regular: 5.527 },
  { city: 'New York', weekEnding: 'Oct 19, 2026', regular: 4.249 },
  { city: 'Los Angeles', weekEnding: 'Oct 19, 2026', regular: 6.021 },
  { city: 'Chicago', weekEnding: 'Oct 19, 2026', regular: 4.705 },
  { city: 'Houston', weekEnding: 'Oct 19, 2026', regular: 3.71 },
  { city: 'Toronto', weekEnding: 'Oct 19, 2026', regular: 1.771 },
  { city: 'Mississauga', weekEnding: 'Oct 19, 2026', regular: 1.771 },
  { city: 'Vancouver', weekEnding: 'Oct 19, 2026', regular: 2.055 },

  // Week ending Oct 21, 2026 — appended by scripts/refresh.mjs
  { city: 'Toronto', weekEnding: 'Oct 21, 2026', regular: 1.761 },
  { city: 'Vancouver', weekEnding: 'Oct 21, 2026', regular: 2.06 },
  { city: 'Mississauga', weekEnding: 'Oct 21, 2026', regular: 1.761 },

  // Week ending Oct 26, 2026 / Oct 28, 2026 — appended by scripts/refresh.mjs
  { city: 'Seattle', weekEnding: 'Oct 26, 2026', regular: 5.424 },
  { city: 'New York', weekEnding: 'Oct 26, 2026', regular: 4.178 },
  { city: 'Los Angeles', weekEnding: 'Oct 26, 2026', regular: 5.883 },
  { city: 'Chicago', weekEnding: 'Oct 26, 2026', regular: 4.897 },
  { city: 'Houston', weekEnding: 'Oct 26, 2026', regular: 3.681 },
  { city: 'Toronto', weekEnding: 'Oct 28, 2026', regular: 1.763 },
  { city: 'Vancouver', weekEnding: 'Oct 28, 2026', regular: 2.04 },
  { city: 'Mississauga', weekEnding: 'Oct 28, 2026', regular: 1.763 },

  // Week ending Nov 2, 2026 / Nov 4, 2026 — appended by scripts/refresh.mjs
  { city: 'Seattle', weekEnding: 'Nov 2, 2026', regular: 5.283 },
  { city: 'New York', weekEnding: 'Nov 2, 2026', regular: 4.114 },
  { city: 'Los Angeles', weekEnding: 'Nov 2, 2026', regular: 5.742 },
  { city: 'Chicago', weekEnding: 'Nov 2, 2026', regular: 4.706 },
  { city: 'Houston', weekEnding: 'Nov 2, 2026', regular: 3.625 },
  { city: 'Toronto', weekEnding: 'Nov 4, 2026', regular: 1.68 },
  { city: 'Vancouver', weekEnding: 'Nov 4, 2026', regular: 1.96 },
  { city: 'Mississauga', weekEnding: 'Nov 4, 2026', regular: 1.68 },

  // Week ending Nov 9, 2026 / Nov 10, 2026 — appended by scripts/refresh.mjs
  { city: 'Seattle', weekEnding: 'Nov 9, 2026', regular: 5.07 },
  { city: 'New York', weekEnding: 'Nov 9, 2026', regular: 4.012 },
  { city: 'Los Angeles', weekEnding: 'Nov 9, 2026', regular: 5.559 },
  { city: 'Chicago', weekEnding: 'Nov 9, 2026', regular: 4.461 },
  { city: 'Houston', weekEnding: 'Nov 9, 2026', regular: 3.489 },
  { city: 'Toronto', weekEnding: 'Nov 10, 2026', regular: 1.631 },
  { city: 'Vancouver', weekEnding: 'Nov 10, 2026', regular: 1.89 },
  { city: 'Mississauga', weekEnding: 'Nov 10, 2026', regular: 1.631 },
];
