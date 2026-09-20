# Execution ledger — docs/IMPLEMENTATION_PLAN.md

## Pre-flight
- Empty local repository and empty remote verified. No existing application or unrelated changes.
- Ruling: work in the user's empty project directory on the approved orphan feature branch; a second worktree has no base commit and provides no additional isolation here.
- Interfaces: importer → typed JSON → activity calculator → UI and audio; marker IDs are independent of place IDs so repeated points cannot multiply activity totals.
- The user explicitly authorizes milestone pushes. No additional push confirmation is needed except host-enforced permissions.

## Progress
- Task 1 complete: original files preserved; data/geometry generated; Python import tests observed failing before implementation and now pass 6/6. Every pinned marker center and all eight ordered roads are checked against source geometry. 59 points + one route cover all 28 places.
- Tasks 2–3 complete: adaptive desktop UI and workbook interactions implemented. Build/typecheck pass; 9 unit cases pass (including all 10,087 weekly minute samples); two Chromium browser scenarios pass across seven viewport sizes. 1440×1024 screenshot visually inspected, controls begin at x=1136 as in source. Audio button wiring belongs to Task 4.
- Ruling: agent-browser CLI is not installed; use the project's Playwright runner for browser verification and screenshots. This preserves reproducible browser coverage without an additional automation dependency.
- Task 4 complete: six CC0 samples, source/license manifest and hashes committed. The Web Audio engine uses five workbook roles, distinct-place weighting, fixed master level, 0.8-second activity fades, load cancellation and retry. Chromium audio integration and 12 unit cases pass.
- Task 5 complete: Chromium and DPR 2 pass; WebKit UI/interaction pass and unsupported Web Audio is handled. The installed Firefox binary cannot start on this Windows host (`spawn UNKNOWN`, including outside the sandbox), so no Firefox application assertion ran. README, test report and reviewed 1440-pixel capture are included. Independent final review found no remaining Critical or Important issues after geometry/hash hardening.
