# Desktop verification report

Run date: 2026-09-22 (Asia/Bangkok). Host: Windows desktop environment.

## Automated coverage

- Python import audit: 6 tests covering workbook/SVG extraction, every pinned marker center, ordered preserved road geometry, road substitution and source constraints.
- Vitest: 13 tests covering 10,087 weekly minute samples, open/close boundaries, `Close`, decimal times, 24:00, duplicate markers, approved density/intensity fixtures, audio voice/weight rules and activity soloing.
- Desktop geometry: 1024×768, 1280×720, 1366×768, 1440×900, 1440×1024, 1920×1080 and 2560×1440; map aspect, control separation and horizontal overflow checked after each live resize.
- DPR: Chromium desktop geometry repeated at device scale factors 1 and 2.
- Interaction: sequenced left-to-right Hero reveal, live silent Hero, user-gesture entry, day, minute, real time exit, P14 route, repeated P20 markers, persistent marker selection and details, continuous active glow, adaptive hover tooltip, marker fading, Method reveal, icon controls, night theme and road visibility.
- Audio on Chromium: Hero remains silent before user entry; user-gesture start, decoded local musical samples with measurable output, hover preview, persistent selection solo, smooth activity crossfades, silence at 24:00, pause/resume, one AudioContext, failed fetch/retry and cancellation during load. Crowd audio is not requested.

## Browser results

| Browser target | Result on this host | Scope |
|---|---|---|
| Playwright Chromium | Pass | 8 applicable Chromium/DPR checks passed in a sequential verification run; UI, responsive matrix, interactions and full Web Audio tests |
| Playwright WebKit | Pass for UI and interactions | This Windows Playwright build does not expose `AudioContext`; the application reports the unsupported state and its capability test passes |
| Playwright Firefox | Could not launch on this host | The installed Playwright Firefox binary exits before page creation with Windows `spawn UNKNOWN`, both inside and outside the sandbox; no application assertion ran |
| macOS Safari | Not run | No macOS host was available; Playwright WebKit is simulation coverage and is not reported as a real Safari test |

## Visual reference

At 1440×1024 the map uses the original 1100×1024 viewBox and the control column begins at x=1136, matching the supplied composition. All eight road paths retain the original `d` geometry. Markers share the same source coordinate system, so resize and DPR changes do not recalculate positions. Dynamic labels use Inter with Noto Sans Thai fallback; static artwork remains the supplied outlined SVG.

The latest full-page 1440-pixel capture is preserved at `docs/screenshots/desktop-1440.png` for review beside the supplied source SVGs. The final page uses the supplied `Method (3).svg`, preserved as `sources/method-v3.svg` and served as `public/references/Method.svg`.

The approved data-driven differences from the mockup are the active count, active marker colors (including P15 Workshop and P13 Temple), P14's selected state and the added accessible interaction hit areas.
