import { HistorySnapshot } from '../data/history';

/**
 * Gas Weather — the weekly fuel outlook model and its public grading.
 *
 * Model v1 (deliberately simple, and graded in public):
 * - Trend call: the predicted change for next week is the average weekly
 *   % change (geometric) across the city's recorded history window.
 * - Direction: >= +0.5% Rising, <= -0.5% Falling, otherwise Steady.
 * - No history yet: the call is the baseline "no change" forecast
 *   (Steady, 0.0%) — the benchmark every forecaster is measured against.
 *
 * Grading: when the official snapshot for a predicted week lands in the
 * history, the prediction is graded on direction (hit/miss) and absolute
 * % error. Grades are computed from the frozen ledger + history, so a
 * published call can never be quietly revised.
 */

export type Direction = 'Rising' | 'Falling' | 'Steady';

export interface Prediction {
  city: string;
  issuedOn: string;
  forWeekEnding: string;
  predictedChangePct: number;
  direction: Direction;
  basis: 'trend' | 'baseline';
}

export const STEADY_BAND_PCT = 0.5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function directionFor(changePct: number): Direction {
  if (changePct >= STEADY_BAND_PCT) return 'Rising';
  if (changePct <= -STEADY_BAND_PCT) return 'Falling';
  return 'Steady';
}

export function snapshotsFor(city: string, history: HistorySnapshot[]): HistorySnapshot[] {
  return history.filter((s) => s.city === city);
}

function weeksBetween(a: HistorySnapshot, b: HistorySnapshot): number {
  const diff = Date.parse(b.weekEnding) - Date.parse(a.weekEnding);
  return Math.max(1, Math.round(diff / WEEK_MS));
}

/** Average weekly % change (geometric) across the city's history window. */
export function meanWeeklyChangePct(city: string, history: HistorySnapshot[]): number | null {
  const snaps = snapshotsFor(city, history);
  if (snaps.length < 2) return null;
  const first = snaps[0];
  const last = snaps[snaps.length - 1];
  const weeks = weeksBetween(first, last);
  return (Math.pow(last.regular / first.regular, 1 / weeks) - 1) * 100;
}

export function makePrediction(
  city: string,
  history: HistorySnapshot[],
  issuedOn: string,
  forWeekEnding: string,
): Prediction {
  const trend = meanWeeklyChangePct(city, history);
  if (trend === null) {
    return { city, issuedOn, forWeekEnding, predictedChangePct: 0, direction: 'Steady', basis: 'baseline' };
  }
  const predictedChangePct = Math.round(trend * 10) / 10;
  return {
    city,
    issuedOn,
    forWeekEnding,
    predictedChangePct,
    direction: directionFor(predictedChangePct),
    basis: 'trend',
  };
}

export interface GradedPrediction extends Prediction {
  actualChangePct: number;
  directionCorrect: boolean;
  absErrorPct: number;
}

export function gradePrediction(p: Prediction, history: HistorySnapshot[]): GradedPrediction | null {
  const snaps = snapshotsFor(p.city, history);
  const idx = snaps.findIndex((s) => s.weekEnding === p.forWeekEnding);
  if (idx <= 0) return null; // target week not published yet (or no prior snapshot)
  const prev = snaps[idx - 1];
  const actual = snaps[idx];
  const weeks = weeksBetween(prev, actual);
  const actualWeeklyPct = (Math.pow(actual.regular / prev.regular, 1 / weeks) - 1) * 100;
  return {
    ...p,
    actualChangePct: Math.round(actualWeeklyPct * 10) / 10,
    directionCorrect: directionFor(actualWeeklyPct) === p.direction,
    absErrorPct: Math.round(Math.abs(actualWeeklyPct - p.predictedChangePct) * 10) / 10,
  };
}

export interface LedgerSummary {
  graded: GradedPrediction[];
  pending: Prediction[];
  directionHits: number;
  meanAbsErrorPct: number | null;
}

export function summarizeLedger(predictions: Prediction[], history: HistorySnapshot[]): LedgerSummary {
  const graded: GradedPrediction[] = [];
  const pending: Prediction[] = [];
  for (const p of predictions) {
    const g = gradePrediction(p, history);
    if (g) graded.push(g);
    else pending.push(p);
  }
  const directionHits = graded.filter((g) => g.directionCorrect).length;
  const meanAbsErrorPct =
    graded.length > 0
      ? Math.round((graded.reduce((sum, g) => sum + g.absErrorPct, 0) / graded.length) * 10) / 10
      : null;
  return { graded, pending, directionHits, meanAbsErrorPct };
}
