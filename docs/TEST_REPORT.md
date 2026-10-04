# Responsive verification report

Run date: 2026-09-27 (Asia/Bangkok). Host: Windows desktop environment.

Mobile layout update: 2026-10-04 (Asia/Bangkok). The phone layout places the original SVG map above the controls, keeps the source geometry, enlarges navigation and control touch targets, moves selected-place details below the map, widens About slides, and fits Method tables to narrow screens. Activity, source data, time and audio logic were unchanged.

The latest control-panel comparison captures are `docs/screenshots/ui-v5/control-panel-desktop-1280.png` and `docs/screenshots/ui-v5/control-panel-mobile-394.png`. The panel matches the supplied desktop card bounds (about x=914–1239, y=258–675) and the phone card/controls order (buttons above the card, about x=32–358, y=530–947). Dynamic map activity and audio status are expected to differ from the static SVG examples.

## Automated coverage

- Pulse ring/control-panel update, 2026-10-04: active points remain fixed while one category-colored ring expands from scale 1 to 2.6 and fades from 0.28 opacity to zero. Inactive points have no rings. The desktop panel and phone layout were compared with the two new SVG references in `sources/ui-v5/`; phone controls sit above the rounded panel and retain 44px touch targets. Verified in Chromium/WebKit. Chromium entry tests separately force allowed and blocked autoplay policies; allowed entry produces measurable audio without clicking, blocked entry exposes Play, and explicit Pause survives navigation. Browser policy cannot be overridden by the site. No-active-place times remain silent.

- Python import audit: 6 tests covering workbook/SVG extraction, every pinned marker center, ordered preserved road geometry, road substitution and source constraints.
- Vitest: 13 tests covering 10,087 weekly minute samples, open/close boundaries, `Close`, decimal times, 24:00, duplicate markers, approved density/intensity fixtures, audio voice/weight rules and activity soloing.
- Desktop geometry: 1280×720, 1280×800, 1280×1024, 1440×900, 1600×900 and 1920×1080; map aspect, control separation, header containment and horizontal overflow checked after each live resize, plus continuous 32-pixel resize steps from 1280–1920.
- DPR: Chromium desktop geometry repeated at device scale factors 1 and 2.
- Phone geometry and interaction: Chromium and WebKit mobile emulation at 320, 375, 390 and 430 CSS pixels; map/control separation, aspect ratio, no horizontal overflow, 44px navigation and control targets, touch marker selection, About carousel centering and expanded Method tables.
- Interaction: Bangkok real-time entry with a bounded autoplay attempt; hash navigation and history with preserved state; day buttons; minute selection; P14 fixed route; repeated P20 markers; persistent selection; continuous expanding and fading rings around fixed active points; route stroke pulse without geometry movement; adaptive tooltip; About carousel keyboard endpoints; independent Method disclosures; icon controls; night theme and road visibility.
- Audio on Chromium: user-gesture start, decoded local musical samples with measurable output, hover preview, persistent selection across page switches, smooth activity crossfades, silence at 24:00, pause/resume, one AudioContext, failed fetch/retry and cancellation during load. Crowd audio is not requested.

## Browser results

The latest Chromium, DPR 2 Chromium, and WebKit run completed with **23 passed and 6 skipped**. Skips: three Web Audio cases on Windows WebKit, two Chromium-policy autoplay cases on WebKit, and the unsupported-audio test on Chromium (which has Web Audio).

| Browser target | Result on this host | Scope |
|---|---|---|
| Playwright Chromium | Pass | Desktop and phone UI, responsive matrix, navigation, carousel, disclosures, interactions and full Web Audio tests |
| Playwright WebKit | Pass for UI and interactions | Desktop and phone UI passed; this Windows Playwright build does not expose `AudioContext`, so Web Audio cases are skipped and its unsupported-capability test passes |
| Playwright Firefox | Could not launch on this host | The installed Playwright Firefox binary exits before page creation with Windows `spawn UNKNOWN`, both inside and outside the sandbox; no application assertion ran |
| macOS Safari | Not run | No macOS host was available; Playwright WebKit is simulation coverage and is not reported as a real Safari test |

## Visual reference

The revised source artwork uses a 1280×1024 reference artboard. The map keeps the original 1100×1024 viewBox while its desktop grid column and phone-width stacked layout respond to available space. All eight road paths retain their original `d` geometry. Markers stay in the same source coordinate system, so resize and DPR changes do not recalculate positions.

Map, About, and Method screenshots at the four principal widths are preserved in `docs/screenshots/ui-v4/`. The source ZIP and every supplied SVG are preserved in `sources/ui-v4/`.

Phone screenshots at 320 and 390 CSS pixels are preserved in `docs/screenshots/mobile/`. They are browser simulations on Windows; no physical iPhone or Android device was available.

The approved data-driven differences from the mockup are the active count, active marker colors (including P15 Workshop and P13 Temple), P14's selected state and the added accessible interaction hit areas.
