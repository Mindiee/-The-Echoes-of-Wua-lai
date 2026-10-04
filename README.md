# The Echoes of Wua-lai

Interactive soundscape of Wua-lai's craft activity. The React application uses the supplied SVG artwork and workbook data, then turns the active places at a selected day and minute into a five-role generative Web Audio score.

The layout supports phones from 320 CSS pixels wide and desktop browser viewports from 1280–1920 CSS pixels wide. The supplied 1280×1024 SVG is the desktop visual reference; the map keeps its geometry while the phone layout places the map above its controls.

## Run locally

Requirements: Node.js 20+ and Python 3.11+.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The Soundscape opens at the current time in `Asia/Bangkok` and remains silent until Play or a marker is pressed. The header switches between Soundscape, About Wua-lai, and Method while preserving the selected time, place, and sound state. All runtime audio is stored in the repository, so playback makes no remote requests.

Selecting a marker keeps its place highlighted, fades the other markers, opens its current-day details and isolates its continuous activity voice. Selecting another marker crossfades to the new voice. Hovering previews an activity and shows an automatically positioned tooltip. Every active point gently expands and glows in its category color for its entire active period, independently of audio playback; P14 pulses through stroke and glow without changing its route geometry.

## Source data

The original prompt, ZIP, workbook and annotated position SVG are preserved in `sources/`. The latest UI package is preserved in `sources/ui-v4/` with SHA-256 documented in `docs/UI_REFRESH_PROGRESS.md`. Original photographs extracted without recompression are served from `public/about/`.

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

The browser suite checks phones at 320, 375, 390, and 430 CSS pixels, plus 1280×720, 1280×800, 1280×1024, 1440×900, 1600×900, and 1920×1080 desktops; continuous resize behavior; proportional map geometry; touch selection; page navigation; carousel and disclosure keyboard behavior; marker state; and Web Audio failure/retry/cancellation. A separate DPR 2 Chromium project repeats the desktop geometry suite.

Reviewed Map, About, and Method captures at 1280, 1440, 1600, and 1920 pixels are in `docs/screenshots/ui-v4/`; phone captures are in `docs/screenshots/mobile/`.

## Project structure

- `src/activity.ts` — pure schedule, density and intensity calculations
- `src/data/` — generated source data and TypeScript types
- `src/components/` — responsive map, controls, About carousel, Method disclosures, tooltip and detail dialog
- `src/audio/` — UI-independent Web Audio engine and score model
- `scripts/import_sources.py` — reproducible XLSX/SVG import and validation
- `scripts/download_audio.py` — reproducible CC0 asset download and hash check
- `tests/` — data, schedule, score and browser coverage
- `SOUND_SOURCES.md` — creators, source pages, CC0 status and runtime processing

Density counts distinct active places even when a place has several markers. Intensity sums each active place's category weight once. P14 produces Market and Culture voices while retaining one 1.2 weight contribution.

## Branch

The reviewed source is delivered on `codex/wua-lai-prototype`. Generated dependencies (`node_modules`), build output (`dist`) and browser artifacts (`test-results`, `playwright-report`) are intentionally ignored.
