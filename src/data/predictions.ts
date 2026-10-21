import { Prediction } from '../lib/outlook';

/**
 * The Gas Weather ledger — every outlook call FuelFlux has published.
 *
 * APPEND-ONLY. An issued call is never edited or deleted; when the official
 * numbers for its week land in history.ts, the app grades it in public
 * (see summarizeLedger in src/lib/outlook.ts). New calls are generated with
 * makePrediction() as part of the weekly refresh.
 */
export const PREDICTIONS: Prediction[] = [
  // Issued Oct 20, 2026 — for week ending Oct 26, 2026 (Edition #1)
  { city: 'Seattle', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: -0.7, direction: 'Falling', basis: 'trend' },
  { city: 'New York', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: -0.9, direction: 'Falling', basis: 'trend' },
  { city: 'Los Angeles', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: 0.1, direction: 'Steady', basis: 'trend' },
  { city: 'Chicago', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: -0.9, direction: 'Falling', basis: 'trend' },
  { city: 'Houston', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: -1.0, direction: 'Falling', basis: 'trend' },
  { city: 'Toronto', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: 0, direction: 'Steady', basis: 'baseline' },
  { city: 'Mississauga', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: 0, direction: 'Steady', basis: 'baseline' },
  { city: 'Vancouver', issuedOn: 'Oct 20, 2026', forWeekEnding: 'Oct 26, 2026', predictedChangePct: 0, direction: 'Steady', basis: 'baseline' },
];
