#!/usr/bin/env node
/**
 * Emits public/data.json — the feed behind the free embeddable widget —
 * from the same data modules the app uses, so the two can never drift.
 * Runs automatically as the npm `prebuild` step (local + CI deploys).
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(mkdtempSync(join(tmpdir(), 'fuelflux-widget-')), 'bundle.mjs');

await build({
  entryPoints: [join(ROOT, 'scripts/widget-entry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  logLevel: 'silent',
});

const { data } = await import(pathToFileURL(outfile).href);
writeFileSync(join(ROOT, 'public/data.json'), JSON.stringify(data, null, 2) + '\n');
console.log(`emit-data: public/data.json written (${data.cities.length} cities)`);
