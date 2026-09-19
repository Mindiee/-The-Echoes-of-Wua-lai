# The Echoes of Wua-lai — approved implementation plan

Approved in the task on 2026-09-20. Source brief: `sources/build-prompt.md`.

## Delivery
React + TypeScript + Vite, native Web Audio, one page, no backend. Desktop Windows/macOS, 1024 CSS px and up. Reference 1440×1024 is a comparison canvas, not a fixed browser width. No mobile layout or online deployment this iteration. Keep data, audio and layout independent for a future mobile view.

## Source of truth and approved resolutions
- Preserve all provided files. Read all four Excel sheets (including its original spelling `ategory Weight`). Generate reproducible JSON from source data; no invented activities/weights.
- Opening hours are activity hours. Intervals include opening, exclude closing. `Close` is closed, `16.00` means 16:00. Weekly Bangkok schedule, Monday noon initially, 24:00 is the end of the selected day.
- Count 28 distinct place IDs, not visual markers. Repeated points share state, details and sound. P14 is the original blue walking-street path; P25 is (838,249).
- Position SVG supplies coordinates. Original SVG road geometry must remain unchanged. Position labels are reference annotations, not product UI.
- Excel categories determine colors, including P15 Workshop and both P13 points Temple. Five visual legend groups: Temple, Workshop, Museum, Market (Silver Shop + Market Night), Crafthouse. Keep the six underlying weights.
- Activity Density = distinct active activities; Sound Intensity = sum of their category weights. P14 has Market and Culture sound roles but contributes once (1.2).

## UI / audio contract
Hero → interactive map with controls/timeline → Method. Use original static SVG text. Dynamic text uses Inter with Thai fallback. CSS Grid/Flex, proportional SVG, shared viewBox for hit targets and markers, distinct map/control areas. No redesign, dashboard or extra cards. Reference layout preserved at 1440×1024, adaptive whitespace elsewhere.
Click markers/route for place, category, selected-day hours, activity and active state. Four buttons: mute, theme, roads, play. Theme never affects data. Roads toggles grey background roads, not the P14 activity route. Real Time uses Asia/Bangkok and stops when the user edits either slider. Play never advances manual time.
Audio starts only on Play; native Web Audio, five sound roles, licensed redistributable samples and source/author/license/modifications manifest. Intensity controls density/layers/events, not master volume. 0.8-second fades on activity changes; silence with no active places. Separate pause/mute. Handle and retry fetch/decode failures without reporting successful playback.

## Verification
Data: 28 places, six weights, five sound roles; join completeness, duplicate IDs, time boundaries, Close, decimal time, 24:00, repeated markers. Regression (density/intensity): Monday noon 27/20.4; Thursday noon 26/19.4; Saturday 19:00 9/6.8; Sunday noon 20/14.2. Saturday market active only 16:00≤t<23:00.
UI: compare 1440×1024 reference; check 1024×768,1280×720,1366×768,1440×900,1440×1024,1920×1080,2560×1440, DPR1/2, continuous resize. No overflow, clipping, stretched map or marker drift. Check day/time/realtime/details/all four buttons, keyboard, rapid transitions, fetch failure. Build, typecheck, unit and browser tests. Chromium/Firefox/WebKit if available; never call emulation real macOS Safari verification.

## Milestones (commit and push each)
1. Sources, audit, reproducible import, reviewed position mapping.
2. Desktop UI and reference comparison.
3. Data/time calculations and map interactions.
4. Audio, assets, licenses and transitions.
5. Full desktop checks, documentation and final fixes.
Repository: Mindiee/-The-Echoes-of-Wua-lai. Branch: codex/wua-lai-prototype. Do not commit node_modules or dist.
