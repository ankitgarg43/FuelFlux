import { describe, it, expect } from 'vitest';
import {
  directionFor,
  meanWeeklyChangePct,
  makePrediction,
  gradePrediction,
  summarizeLedger,
  Prediction,
} from './outlook';
import { HistorySnapshot } from '../data/history';

const hist = (rows: Array<[string, string, number]>): HistorySnapshot[] =>
  rows.map(([city, weekEnding, regular]) => ({ city, weekEnding, regular }));

describe('directionFor', () => {
  it('uses a ±0.5% steady band', () => {
    expect(directionFor(0.5)).toBe('Rising');
    expect(directionFor(2.3)).toBe('Rising');
    expect(directionFor(-0.5)).toBe('Falling');
    expect(directionFor(-1.2)).toBe('Falling');
    expect(directionFor(0.49)).toBe('Steady');
    expect(directionFor(0)).toBe('Steady');
  });
});

describe('meanWeeklyChangePct', () => {
  it('annualizes a 4-week move to a weekly geometric mean', () => {
    const h = hist([
      ['Seattle', 'Sep 21, 2026', 5.693],
      ['Seattle', 'Oct 19, 2026', 5.528],
    ]);
    const v = meanWeeklyChangePct('Seattle', h)!;
    expect(v).toBeCloseTo(-0.73, 1);
  });

  it('returns null with fewer than two snapshots', () => {
    expect(meanWeeklyChangePct('Toronto', hist([['Toronto', 'Oct 19, 2026', 1.771]]))).toBeNull();
  });
});

describe('makePrediction', () => {
  it('issues a trend call from history', () => {
    const h = hist([
      ['Houston', 'Sep 21, 2026', 3.863],
      ['Houston', 'Oct 19, 2026', 3.71],
    ]);
    const p = makePrediction('Houston', h, 'Oct 20, 2026', 'Oct 26, 2026');
    expect(p.basis).toBe('trend');
    expect(p.direction).toBe('Falling');
    expect(p.predictedChangePct).toBe(-1.0);
  });

  it('falls back to the no-change baseline without history', () => {
    const p = makePrediction('Toronto', hist([['Toronto', 'Oct 19, 2026', 1.771]]), 'Oct 20, 2026', 'Oct 26, 2026');
    expect(p).toMatchObject({ basis: 'baseline', direction: 'Steady', predictedChangePct: 0 });
  });
});

describe('grading', () => {
  const prediction: Prediction = {
    city: 'Seattle',
    issuedOn: 'Oct 20, 2026',
    forWeekEnding: 'Oct 26, 2026',
    predictedChangePct: -0.7,
    direction: 'Falling',
    basis: 'trend',
  };

  it('stays pending until the target week is published', () => {
    const h = hist([['Seattle', 'Oct 19, 2026', 5.528]]);
    expect(gradePrediction(prediction, h)).toBeNull();
  });

  it('grades direction and error once actuals land', () => {
    const h = hist([
      ['Seattle', 'Oct 19, 2026', 5.528],
      ['Seattle', 'Oct 26, 2026', 5.47], // about -1.0% on the week
    ]);
    const g = gradePrediction(prediction, h)!;
    expect(g.directionCorrect).toBe(true);
    expect(g.actualChangePct).toBeCloseTo(-1.0, 0);
    expect(g.absErrorPct).toBeCloseTo(0.3, 0);
  });

  it('summarizes hits and pending calls', () => {
    const h = hist([
      ['Seattle', 'Oct 19, 2026', 5.528],
      ['Seattle', 'Oct 26, 2026', 5.6], // rose instead — a miss
    ]);
    const s = summarizeLedger([prediction], h);
    expect(s.graded.length).toBe(1);
    expect(s.directionHits).toBe(0);
    expect(s.pending.length).toBe(0);
  });
});
