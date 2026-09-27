# SVG UI refresh audit — 2026-09-27

Source ZIP SHA-256: `E03DE128C1387ACDF28FB87C073F2941E31EE832A76644643C4DC616A1ED7DC0`.
Reference artboard: 1280×1024. Target: desktop 1280–1920 CSS pixels.

- Activity, data, audio implementation, road geometry, and marker coordinates are unchanged.
- Active Map is the silent Bangkok real-time entry. Hash navigation preserves map/audio/time state.
- Active points use continuous scale/glow; P14 uses stroke/glow without scaling its route.
- About uses the five original embedded photographs extracted without recompression. Method renders the original content as independent disclosures.
- Responsive screenshot matrix: Map, About, and Method at 1280×800, 1440×900, 1600×900, and 1920×1080 in `docs/screenshots/ui-v4/`.
- Real iOS Safari is unavailable on this Windows host. WebKit verification is reported separately and does not claim hardware Safari coverage.

Safari/version investigation: production branch and GitHub SHA matched before implementation; Chrome and iPhone Safari user agents received identical HTML/assets; HTML used `max-age=0, must-revalidate`; no service worker registration was present. The reported difference was motion behavior rather than stale content.
