# Execution ledger — docs/IMPLEMENTATION_PLAN.md

## Pre-flight
- Empty local repository and empty remote verified. No existing application or unrelated changes.
- Ruling: work in the user's empty project directory on the approved orphan feature branch; a second worktree has no base commit and provides no additional isolation here.
- Interfaces: importer → typed JSON → activity calculator → UI and audio; marker IDs are independent of place IDs so repeated points cannot multiply activity totals.
- The user explicitly authorizes milestone pushes. No additional push confirmation is needed except host-enforced permissions.

## Progress
- Task 1 complete: original files preserved; data/geometry generated; Python import tests observed failing before implementation and passing 4/4 afterward. Eight roads match original geometry. 59 points + one route cover all 28 places.
- Tasks 2–3 complete: adaptive desktop UI and workbook interactions implemented. Build/typecheck pass; 9 unit cases pass (including all 10,087 weekly minute samples); two Chromium browser scenarios pass across seven viewport sizes. 1440×1024 screenshot visually inspected, controls begin at x=1136 as in source. Audio button wiring belongs to Task 4.
- Ruling: agent-browser CLI is not installed; use the project's Playwright runner for browser verification and screenshots. This preserves reproducible browser coverage without an additional automation dependency.
