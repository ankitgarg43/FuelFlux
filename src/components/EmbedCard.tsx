import React, { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';
import { getCoveredCities } from '../services/stationService';
import { SITE_URL } from '../lib/widgetData';

/**
 * The free embeddable widget: pick a city, copy one iframe line, done.
 * The widget (public/widget.html + public/data.json) is regenerated from
 * the app's own data on every build, so embedded copies stay current
 * with the weekly refresh — no API key, no tracking, free forever.
 */
export const EmbedCard: React.FC = () => {
  const cities = getCoveredCities();
  const [label, setLabel] = useState('Toronto, ON');
  const [copied, setCopied] = useState(false);

  const name = label.split(',')[0];
  const widgetUrl = `${SITE_URL}widget.html?city=${encodeURIComponent(name)}`;
  const snippet = `<iframe src="${widgetUrl}" width="340" height="215" style="border:0;border-radius:12px;overflow:hidden" loading="lazy" title="FuelFlux weekly gas prices — ${label}"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — the input below is selectable as a fallback.
    }
  };

  return (
    <section
      aria-label="Embed FuelFlux on your site"
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6"
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Code2 size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <h2 className="text-base font-display font-semibold text-slate-900 dark:text-white">
          Embed FuelFlux — free
        </h2>
      </div>
      <div className="p-4 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Put live weekly prices and the Gas Weather outlook on your own site, blog, or
            community page. One line of code — no API key, no sign-up, no tracking. It
            updates itself every week with the same official EIA / NRCan data as this page.
          </p>
          <label
            htmlFor="embedCity"
            className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider block mt-4 mb-1.5"
          >
            Widget city
          </label>
          <select
            id="embedCity"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-3">
            <input
              readOnly
              value={snippet}
              aria-label="Embed code"
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={copy}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Developers: the same data is a plain JSON feed at{' '}
            <span className="font-mono">{SITE_URL}data.json</span> — free to use with attribution.
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
            Preview
          </span>
          <iframe
            src={`widget.html?city=${encodeURIComponent(name)}`}
            width="340"
            height="215"
            style={{ border: 0, borderRadius: 12, overflow: 'hidden', maxWidth: '100%' }}
            loading="lazy"
            title={`FuelFlux widget preview — ${label}`}
            className="border border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>
    </section>
  );
};
