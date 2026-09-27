# Desktop verification report

Run date: 2026-09-27 (Asia/Bangkok). Host: Windows desktop environment.

## Automated coverage

- Python import audit: 6 tests covering workbook/SVG extraction, every pinned marker center, ordered preserved road geometry, road substitution and source constraints.
- Vitest: 13 tests covering 10,087 weekly minute samples, open/close boundaries, `Close`, decimal times, 24:00, duplicate markers, approved density/intensity fixtures, audio voice/weight rules and activity soloing.
- Desktop geometry: 1280×720, 1280×800, 1280×1024, 1440×900, 1600×900 and 1920×1080; map aspect, control separation, header containment and horizontal overflow checked after each live resize, plus continuous 32-pixel resize steps from 1280–1920.
- DPR: Chromium desktop geometry repeated at device scale factors 1 and 2.
- Interaction: silent Bangkok real-time entry; hash navigation and history with preserved state; day buttons; minute selection; P14 fixed route; repeated P20 markers; persistent selection; point scale/glow pulse; route stroke/glow pulse; adaptive tooltip; About carousel keyboard endpoints; independent Method disclosures; icon controls; night theme and road visibility.
- Audio on Chromium: user-gesture start, decoded local musical samples with measurable output, hover preview, persistent selection across page switches, smooth activity crossfades, silence at 24:00, pause/resume, one AudioContext, failed fetch/retry and cancellation during load. Crowd audio is not requested.

## Browser results

The final Chromium, DPR 2 Chromium, and WebKit run completed with **15 passed and 4 skipped**. The four skips are the Web Audio cases that the Windows Playwright WebKit build cannot execute; its explicit unsupported-capability test passed.

| Browser target | Result on this host | Scope |
|---|---|---|
| Playwright Chromium | Pass | UI, responsive matrix, navigation, carousel, disclosures, interactions and full Web Audio tests |
| Playwright WebKit | Pass for UI and interactions | This Windows Playwright build does not expose `AudioContext`; the application reports the unsupported state and its capability test passes |
| Playwright Firefox | Could not launch on this host | The installed Playwright Firefox binary exits before page creation with Windows `spawn UNKNOWN`, both inside and outside the sandbox; no application assertion ran |
| macOS Safari | Not run | No macOS host was available; Playwright WebKit is simulation coverage and is not reported as a real Safari test |

## Visual reference

The revised source artwork uses a 1280×1024 reference artboard. The map keeps the original 1100×1024 viewBox while its grid column responds to available width and height. All eight road paths retain their original `d` geometry. Markers stay in the same source coordinate system, so resize and DPR changes do not recalculate positions.

Map, About, and Method screenshots at the four principal widths are preserved in `docs/screenshots/ui-v4/`. The source ZIP and every supplied SVG are preserved in `sources/ui-v4/`.

The approved data-driven differences from the mockup are the active count, active marker colors (including P15 Workshop and P13 Temple), P14's selected state and the added accessible interaction hit areas.
