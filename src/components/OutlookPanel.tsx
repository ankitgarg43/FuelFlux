import React from 'react';
import { CloudSun, TrendingDown, TrendingUp, Minus, ClipboardCheck } from 'lucide-react';
import { CITY_PRICES } from '../data/fuelData';
import { HISTORY } from '../data/history';
import { PREDICTIONS } from '../data/predictions';
import {
  Direction,
  meanWeeklyChangePct,
  snapshotsFor,
  summarizeLedger,
} from '../lib/outlook';

function formatNative(city: string, price: number): string {
  const info = CITY_PRICES.find((c) => c.city === city);
  if (!info) return price.toFixed(3);
  return info.currency === 'CAD' ? `${(price * 100).toFixed(1)}¢/L` : `$${price.toFixed(3)}/gal`;
}

function DirectionChip({ direction, pct }: { direction: Direction; pct: number }) {
  const styles: Record<Direction, string> = {
    Falling: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Rising: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    Steady: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  };
  const Icon = direction === 'Falling' ? TrendingDown : direction === 'Rising' ? TrendingUp : Minus;
  const sign = pct > 0 ? '+' : '';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[direction]}`}>
      <Icon className="w-3.5 h-3.5" />
      {direction} {sign}
      {pct.toFixed(1)}%
    </span>
  );
}

const OutlookPanel: React.FC = () => {
  const ledger = summarizeLedger(PREDICTIONS, HISTORY);
  const gradedByKey = new Map(ledger.graded.map((g) => [`${g.city}|${g.forWeekEnding}`, g]));
  const nextWeek = PREDICTIONS.length > 0 ? PREDICTIONS[PREDICTIONS.length - 1].forWeekEnding : null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-1">
        <CloudSun className="w-6 h-6 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Gas Weather</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        A weekly fuel outlook for every covered city. Each call is published in advance and graded in
        public when the official numbers land — no quiet edits.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {CITY_PRICES.map((info) => {
          const snaps = snapshotsFor(info.city, HISTORY);
          const current = snaps[snaps.length - 1];
          const trend = meanWeeklyChangePct(info.city, HISTORY);
          const call = [...PREDICTIONS].reverse().find((p) => p.city === info.city);
          return (
            <div
              key={info.city}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {info.city}, {info.state}
                </h3>
                <span className="text-xs text-slate-400">Regular</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {current ? formatNative(info.city, current.regular) : '—'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {trend !== null ? (
                  <>
                    Trend: {trend > 0 ? '+' : ''}
                    {trend.toFixed(1)}%/week over the recorded window
                  </>
                ) : (
                  'History starts this week'
                )}
              </div>
              {call && (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Next week ({call.forWeekEnding.replace(', 2026', '')}):
                  </span>
                  <DirectionChip direction={call.direction} pct={call.predictedChangePct} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-slate-800 dark:text-white">The Ledger — every call, graded</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {ledger.graded.length > 0 ? (
            <>
              Direction: <strong>{ledger.directionHits}/{ledger.graded.length}</strong> correct
              {ledger.meanAbsErrorPct !== null && (
                <> · Average error: <strong>{ledger.meanAbsErrorPct.toFixed(1)}%</strong></>
              )}{' '}
              · {ledger.pending.length} call(s) awaiting data.
            </>
          ) : (
            <>
              No graded calls yet. Edition #1 was issued Oct 20, 2026
              {nextWeek ? ` for the week ending ${nextWeek}` : ''} — grades appear here automatically
              when the official EIA/NRCan numbers for that week are published.
            </>
          )}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-3 font-medium">City</th>
                <th className="py-2 pr-3 font-medium">Week ending</th>
                <th className="py-2 pr-3 font-medium">Call</th>
                <th className="py-2 pr-3 font-medium">Basis</th>
                <th className="py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {PREDICTIONS.map((p) => {
                const g = gradedByKey.get(`${p.city}|${p.forWeekEnding}`);
                return (
                  <tr key={`${p.city}-${p.forWeekEnding}`} className="border-b border-slate-100 dark:border-slate-700/60">
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-200">{p.city}</td>
                    <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">{p.forWeekEnding}</td>
                    <td className="py-2 pr-3">
                      <DirectionChip direction={p.direction} pct={p.predictedChangePct} />
                    </td>
                    <td className="py-2 pr-3 text-slate-500 dark:text-slate-400 capitalize">{p.basis}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">
                      {g
                        ? g.directionCorrect
                          ? `✓ Direction hit (actual ${g.actualChangePct > 0 ? '+' : ''}${g.actualChangePct.toFixed(1)}%)`
                          : `✗ Missed (actual ${g.actualChangePct > 0 ? '+' : ''}${g.actualChangePct.toFixed(1)}%)`
                        : 'Pending'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
          How it works: the call for next week is the average weekly % change (geometric) across each
          city's recorded official history; ±0.5% counts as Steady. Cities without history get the
          baseline "no change" call — the benchmark forecasters are judged against. A simple,
          transparent model; an outlook is a tendency, not a guarantee.
        </p>
      </div>
    </section>
  );
};

export default OutlookPanel;
