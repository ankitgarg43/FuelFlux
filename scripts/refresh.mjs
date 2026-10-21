#!/usr/bin/env node
/**
 * Weekly FuelFlux refresh — fetches the latest official weekly prices and
 * updates the app's data files:
 *   1. src/data/fuelData.ts    — averages + weekEnding per city
 *   2. src/data/history.ts     — appends a Regular-price snapshot per city
 *   3. src/data/predictions.ts — appends the model's next Gas Weather calls
 *      (mirror of src/lib/outlook.ts — keep the math in sync)
 *
 * Sources (no API keys anywhere):
 * - US: EIA weekly workbooks pswrgvwall.xls (gasoline: Data 3 = Regular,
 *   Data 6 = Midgrade, Data 9 = Premium, all-formulations city series) and
 *   psw18vwall.xls (diesel ultra-low sulfur: Data 5, PADD-district series).
 * - CA: NRCan price map page. Each city row lists (Price, Taxes, Marketing
 *   Margin) x (Regular, Midgrade, Premium, Diesel), so after the city name
 *   the grade prices sit at numeric-token indexes 0, 3, 6, 9 (cents/litre).
 *
 * Safety: every fetched value must be within +/-20% of the value on file or
 * the run aborts without writing anything. If the fetched week is not newer
 * than the data on file, the run is a no-op (exit 0, no writes).
 *
 * Usage: node scripts/refresh.mjs [--dry-run] [--us-only] [--ca-fixture FILE]
 *   --dry-run     fetch + validate + report, write nothing
 *   --us-only     skip Canada (for testing where NRCan is unreachable)
 *   --ca-fixture  parse NRCan data from a saved HTML file instead of fetching
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FUELDATA = join(ROOT, 'src/data/fuelData.ts');
const HISTORY = join(ROOT, 'src/data/history.ts');
const PREDICTIONS = join(ROOT, 'src/data/predictions.ts');

const GAS_XLS_URL = 'https://www.eia.gov/petroleum/gasdiesel/xls/pswrgvwall.xls';
const DIESEL_XLS_URL = 'https://www.eia.gov/petroleum/gasdiesel/xls/psw18vwall.xls';
const NRCAN_URL = 'https://www2.nrcan.gc.ca/eneene/sources/pripri/price_map_e.cfm?wbdisable=true';

const US_CITIES = [
  { city: 'Seattle', code: 'Y48SE', dieselArea: 'R5XCA' }, // West Coast excl. California
  { city: 'New York', code: 'Y35NY', dieselArea: 'R10' }, // PADD 1 (East Coast)
  { city: 'Los Angeles', code: 'Y05LA', dieselArea: 'SCA' }, // California
  { city: 'Chicago', code: 'YORD', dieselArea: 'R20' }, // PADD 2 (Midwest)
  { city: 'Houston', code: 'Y44HO', dieselArea: 'R30' }, // PADD 3 (Gulf Coast)
];
const GAS_SHEETS = { Regular: ['Data 3', 'EPMR'], Midgrade: ['Data 6', 'EPMM'], Premium: ['Data 9', 'EPMP'] };
const CA_CITIES = ['Toronto', 'Vancouver']; // Mississauga mirrors Toronto

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
const parseDate = (s) => new Date(Date.parse(s));
const round3 = (v) => Math.round(v * 1000) / 1000;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const US_ONLY = args.includes('--us-only');
const fixtureIdx = args.indexOf('--ca-fixture');
const CA_FIXTURE = fixtureIdx >= 0 ? args[fixtureIdx + 1] : null;

function fail(msg) {
  console.error(`REFRESH ABORTED: ${msg}`);
  process.exit(1);
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'FuelFlux-Refresh/1.0' } });
  if (!res.ok) fail(`GET ${url} -> HTTP ${res.status}`);
  return res;
}

/** Latest { value, date } for one series key in one worksheet. */
function latestByKey(wb, sheetName, key) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) fail(`workbook is missing sheet ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  const col = (rows[1] || []).indexOf(key);
  if (col < 0) fail(`series key ${key} not found in ${sheetName}`);
  let best = null;
  for (const r of rows.slice(3)) {
    if (typeof r[0] !== 'number' || typeof r[col] !== 'number') continue;
    if (!best || r[0] > best.serial) best = { serial: r[0], value: r[col] };
  }
  if (!best) fail(`no data for ${key} in ${sheetName}`);
  const date = new Date(Math.round((best.serial - 25569) * 86400 * 1000));
  return { value: best.value, date };
}

async function fetchUS() {
  const gasBuf = Buffer.from(await (await download(GAS_XLS_URL)).arrayBuffer());
  const dslBuf = Buffer.from(await (await download(DIESEL_XLS_URL)).arrayBuffer());
  const gas = XLSX.read(gasBuf, { type: 'buffer' });
  const dsl = XLSX.read(dslBuf, { type: 'buffer' });

  const out = {};
  let latestDate = null;
  for (const { city, code, dieselArea } of US_CITIES) {
    const averages = {};
    for (const [grade, [sheet, product]] of Object.entries(GAS_SHEETS)) {
      const { value, date } = latestByKey(gas, sheet, `EMM_${product}_PTE_${code}_DPG`);
      averages[grade] = round3(value);
      if (!latestDate || date > latestDate) latestDate = date;
    }
    const diesel = latestByKey(dsl, 'Data 5', `EMD_EPD2DXL0_PTE_${dieselArea}_DPG`);
    averages.Diesel = round3(diesel.value);
    out[city] = { averages, weekEnding: fmtDate(latestDate) };
  }
  return out;
}

/** Strip HTML to plain text the way a browser renders the table. */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

function parseNRCan(html) {
  const text = htmlToText(html);
  const out = {};
  for (const city of CA_CITIES) {
    let idx = -1;
    let tokens = null;
    // Find the table-row occurrence: the city name immediately followed by
    // its first price (nav mentions are followed by words, not numbers).
    for (let from = 0; ; ) {
      const i = text.indexOf(city, from);
      if (i < 0) break;
      const rest = text.slice(i + city.length, i + city.length + 300);
      if (/^\s*\d+\.\d+/.test(rest)) {
        const nums = (rest.match(/\d+\.\d+/g) || []).map(Number);
        if (nums.length >= 10 && nums[0] > 100 && nums[0] < 400) {
          idx = i;
          tokens = nums;
          break;
        }
      }
      from = i + city.length;
    }
    if (idx < 0 || !tokens) fail(`NRCan: no price row found for ${city}`);
    // Date: last "D-Mon-YYYY" before the row (province section header).
    const before = text.slice(Math.max(0, idx - 3000), idx);
    const dates = [...before.matchAll(/(\d{1,2})-([A-Z][a-z]{2})-(\d{4})/g)];
    const weekEnding = dates.length
      ? fmtDate(new Date(Date.UTC(+dates[dates.length - 1][3], MONTHS.indexOf(dates[dates.length - 1][2]), +dates[dates.length - 1][1])))
      : fmtDate(new Date());
    out[city] = {
      averages: {
        Regular: round3(tokens[0] / 100),
        Midgrade: round3(tokens[3] / 100),
        Premium: round3(tokens[6] / 100),
        Diesel: round3(tokens[9] / 100),
      },
      weekEnding,
    };
  }
  // Mississauga is not surveyed by NRCan — same GTA market as Toronto.
  out['Mississauga'] = out['Toronto'];
  return out;
}

async function fetchCA() {
  if (CA_FIXTURE) return parseNRCan(readFileSync(CA_FIXTURE, 'utf8'));
  const res = await download(NRCAN_URL);
  return parseNRCan(await res.text());
}

// ---------- read current files ----------
function readCurrent() {
  const src = readFileSync(FUELDATA, 'utf8');
  const current = {};
  for (const m of src.matchAll(/city: '([^']+)',/g)) {
    const block = src.slice(m.index, m.index + 1200);
    const week = block.match(/weekEnding: '([^']+)'/);
    const avg = block.match(/averages: \{ Regular: ([\d.]+), Midgrade: ([\d.]+), Premium: ([\d.]+), Diesel: ([\d.]+) \}/);
    if (week && avg) {
      current[m[1]] = {
        weekEnding: week[1],
        averages: { Regular: +avg[1], Midgrade: +avg[2], Premium: +avg[3], Diesel: +avg[4] },
      };
    }
  }
  return { src, current };
}

function readHistory() {
  const src = readFileSync(HISTORY, 'utf8');
  const snaps = [...src.matchAll(/\{ city: '([^']+)', weekEnding: '([^']+)', regular: ([\d.]+) \}/g)].map((m) => ({
    city: m[1],
    weekEnding: m[2],
    regular: +m[3],
  }));
  return { src, snaps };
}

// ---------- outlook model (mirror of src/lib/outlook.ts) ----------
const STEADY_BAND_PCT = 0.5;
const directionFor = (pct) => (pct >= STEADY_BAND_PCT ? 'Rising' : pct <= -STEADY_BAND_PCT ? 'Falling' : 'Steady');
function meanWeeklyChangePct(snaps, city) {
  const mine = snaps.filter((s) => s.city === city);
  if (mine.length < 2) return null;
  const first = mine[0];
  const last = mine[mine.length - 1];
  const weeks = Math.max(1, Math.round((parseDate(last.weekEnding) - parseDate(first.weekEnding)) / (7 * 86400 * 1000)));
  return (Math.pow(last.regular / first.regular, 1 / weeks) - 1) * 100;
}
function makePrediction(snaps, city, issuedOn, forWeekEnding) {
  const trend = meanWeeklyChangePct(snaps, city);
  if (trend === null) {
    return { city, issuedOn, forWeekEnding, predictedChangePct: 0, direction: 'Steady', basis: 'baseline' };
  }
  const predictedChangePct = Math.round(trend * 10) / 10;
  return { city, issuedOn, forWeekEnding, predictedChangePct, direction: directionFor(predictedChangePct), basis: 'trend' };
}

// ---------- main ----------
const { src: fuelSrc, current } = readCurrent();
const { src: histSrc, snaps } = readHistory();
const predSrc = readFileSync(PREDICTIONS, 'utf8');

const fetched = {};
Object.assign(fetched, await fetchUS());
if (!US_ONLY) Object.assign(fetched, await fetchCA());

// Decide which cities actually advance.
const updates = {};
for (const [city, data] of Object.entries(fetched)) {
  const cur = current[city];
  if (!cur) fail(`city ${city} missing from fuelData.ts`);
  if (parseDate(data.weekEnding) <= parseDate(cur.weekEnding) && !CA_FIXTURE) {
    console.log(`${city}: fetched week ${data.weekEnding} is not newer than on-file ${cur.weekEnding} — skipped`);
    continue;
  }
  for (const grade of ['Regular', 'Midgrade', 'Premium', 'Diesel']) {
    const next = data.averages[grade];
    const prev = cur.averages[grade];
    if (!next || next <= 0 || Math.abs(next - prev) / prev > 0.2) {
      fail(`${city} ${grade}: fetched ${next} is implausible vs on-file ${prev} (>20% move)`);
    }
  }
  updates[city] = data;
}

if (Object.keys(updates).length === 0) {
  console.log('No newer data — nothing to do.');
  process.exit(0);
}

for (const [city, data] of Object.entries(updates)) {
  const cur = current[city];
  console.log(
    `${city}: ${cur.weekEnding} -> ${data.weekEnding} | R ${cur.averages.Regular}->${data.averages.Regular} M ${cur.averages.Midgrade}->${data.averages.Midgrade} P ${cur.averages.Premium}->${data.averages.Premium} D ${cur.averages.Diesel}->${data.averages.Diesel}`,
  );
}

if (DRY_RUN) {
  console.log('Dry run — no files written.');
  process.exit(0);
}

// 1) fuelData.ts
let newFuel = fuelSrc;
for (const [city, data] of Object.entries(updates)) {
  const marker = `city: '${city}',`;
  const start = newFuel.indexOf(marker);
  if (start < 0) fail(`cannot locate block for ${city} in fuelData.ts`);
  const window = newFuel.slice(start, start + 1200);
  const newWindow = window
    .replace(/weekEnding: '[^']+'/, `weekEnding: '${data.weekEnding}'`)
    .replace(
      /averages: \{[^}]+\}/,
      `averages: { Regular: ${data.averages.Regular}, Midgrade: ${data.averages.Midgrade}, Premium: ${data.averages.Premium}, Diesel: ${data.averages.Diesel} }`,
    );
  newFuel = newFuel.slice(0, start) + newWindow + newFuel.slice(start + 1200);
}
newFuel = newFuel.replace(/Last refreshed: .*/, `Last refreshed: ${fmtDate(new Date())} (automated — scripts/refresh.mjs)`);
writeFileSync(FUELDATA, newFuel);

// 2) history.ts — append Regular snapshots for updated cities.
const newSnaps = [...snaps];
const histLines = [];
for (const [city, data] of Object.entries(updates)) {
  if (newSnaps.some((s) => s.city === city && s.weekEnding === data.weekEnding)) continue;
  const snap = { city, weekEnding: data.weekEnding, regular: data.averages.Regular };
  newSnaps.push(snap);
  histLines.push(`  { city: '${city}', weekEnding: '${data.weekEnding}', regular: ${data.averages.Regular} },`);
}
if (histLines.length) {
  const weeks = [...new Set(Object.values(updates).map((u) => u.weekEnding))].join(' / ');
  const block = `\n  // Week ending ${weeks} — appended by scripts/refresh.mjs\n${histLines.join('\n')}\n`;
  const cut = histSrc.lastIndexOf('];');
  writeFileSync(HISTORY, histSrc.slice(0, cut) + block + histSrc.slice(cut));
}

// 3) predictions.ts — one new call per updated city for the following week.
const issuedOn = fmtDate(new Date());
const edition = new Set([...predSrc.matchAll(/issuedOn: '([^']+)'/g)].map((m) => m[1])).size + 1;
const predLines = [];
for (const city of Object.keys(updates)) {
  const lastWeek = updates[city].weekEnding;
  const target = fmtDate(new Date(parseDate(lastWeek).getTime() + 7 * 86400 * 1000));
  if ([...predSrc.matchAll(/forWeekEnding: '([^']+)'/g)].some((m) => m[1] === target) && predSrc.includes(`city: '${city}', issuedOn: '${issuedOn}'`)) continue;
  const p = makePrediction(newSnaps, city, issuedOn, target);
  predLines.push(
    `  { city: '${p.city}', issuedOn: '${p.issuedOn}', forWeekEnding: '${p.forWeekEnding}', predictedChangePct: ${p.predictedChangePct}, direction: '${p.direction}', basis: '${p.basis}' },`,
  );
}
if (predLines.length) {
  const target0 = predLines[0].match(/forWeekEnding: '([^']+)'/)[1];
  const block = `\n  // Issued ${issuedOn} — for week ending ${target0} (Edition #${edition})\n${predLines.join('\n')}\n`;
  const cut = predSrc.lastIndexOf('];');
  writeFileSync(PREDICTIONS, predSrc.slice(0, cut) + block + predSrc.slice(cut));
}

console.log(`Refresh complete: ${Object.keys(updates).length} cities updated, ${histLines.length} snapshots, ${predLines.length} new calls (Edition #${edition}).`);
