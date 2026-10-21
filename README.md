<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e8d3b790-2134-478b-8780-be72c07b6134

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

No API key is needed. Gas prices ship with the app in `src/data/fuelData.ts`,
sourced from official weekly averages — the U.S. EIA weekly retail survey for
US cities and Natural Resources Canada weekly averages for Canadian cities.

## Data refresh (automated)

A scheduled GitHub Action (`.github/workflows/weekly-refresh.yml`, Wednesdays)
runs `scripts/refresh.mjs`, which downloads EIA's weekly workbooks and NRCan's
price page, updates `fuelData.ts`, appends history snapshots, and issues the
next Gas Weather calls — then commits and triggers a redeploy. Run it locally
with `npm run refresh` (`--dry-run` to preview). No API keys anywhere.

## Free embeddable widget

Anyone can put FuelFlux prices + the Gas Weather outlook on their site with
one iframe line (see the "Embed FuelFlux" section on the live page). The
widget (`public/widget.html`) reads `data.json`, a JSON feed regenerated from
the app's own data on every build (`scripts/emit-data.mjs`). Free to use with
attribution; no key, no tracking.
