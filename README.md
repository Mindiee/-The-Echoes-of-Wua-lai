# The Echoes of Wua-lai

Interactive desktop soundscape of Wua-lai's craft activity. The single-page React application uses the supplied SVG artwork and workbook data, then turns the active places at a selected day and minute into a five-role generative Web Audio score.

The current delivery targets desktop browser viewports from 1024 CSS pixels wide. The 1440×1024 source design is the visual reference; the map scales proportionally on other desktop sizes. Mobile UI and public deployment are outside this iteration.

## Run locally

Requirements: Node.js 20+ and Python 3.11+.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The live Hero opens with the title travelling from the left edge into its final column while the map opens behind it, followed by the description. It remains silent; audio starts only after entering the Active Map or pressing Play. All runtime audio is stored in the repository, so playback makes no remote requests.

Selecting a marker keeps its place highlighted, fades the other markers, opens its current-day details and isolates its continuous activity voice. Selecting another marker crossfades to the new voice. Hovering previews an activity and shows an automatically positioned tooltip. Every active marker keeps a subtle category-colored glow pulse for its entire active period, independently of audio playback.

## Source data

The original prompt, ZIP, workbook and annotated position SVG are preserved in `sources/`. Their hashes are in `docs/source-hashes.json`. The extracted design SVGs are in `public/references/`.

Regenerate the typed web data after replacing a source workbook or SVG:

```powershell
npm run import:data
python -m unittest tests/test_import.py
```

The importer validates 28 place IDs, 6 category weights, 5 sound mappings, schedule formats, joins, P14's route and P25's corrected coordinate before writing `src/data/source-data.json`. See `docs/DATA_AUDIT.md` for the audited mapping and calculation fixtures.

## Verification

```powershell
npm run typecheck
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

The browser suite checks the seven approved viewport sizes, continuous resize behavior, proportional map geometry, overflow, marker state, keyboard details, controls, Web Audio failure/retry/cancellation and actual decoded sample output where the test browser exposes Web Audio. A separate DPR 2 Chromium project runs the desktop geometry suite. Current environment results and limits are recorded in `docs/TEST_REPORT.md`.

The reviewed 1440-pixel full-page capture is in `docs/screenshots/desktop-1440.png`.

## Project structure

- `src/activity.ts` — pure schedule, density and intensity calculations
- `src/data/` — generated source data and TypeScript types
- `src/components/` — live Hero, desktop map, detail dialog and controls
- `src/audio/` — UI-independent Web Audio engine and score model
- `scripts/import_sources.py` — reproducible XLSX/SVG import and validation
- `scripts/download_audio.py` — reproducible CC0 asset download and hash check
- `tests/` — data, schedule, score and browser coverage
- `SOUND_SOURCES.md` — creators, source pages, CC0 status and runtime processing

Density counts distinct active places even when a place has several markers. Intensity sums each active place's category weight once. P14 produces Market and Culture voices while retaining one 1.2 weight contribution.

## Branch

The reviewed source is delivered on `codex/wua-lai-prototype`. Generated dependencies (`node_modules`), build output (`dist`) and browser artifacts (`test-results`, `playwright-report`) are intentionally ignored.
