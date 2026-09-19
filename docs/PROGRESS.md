# Execution ledger — docs/IMPLEMENTATION_PLAN.md

## Pre-flight
- Empty local repository and empty remote verified. No existing application or unrelated changes.
- Ruling: work in the user's empty project directory on the approved orphan feature branch; a second worktree has no base commit and provides no additional isolation here.
- Interfaces: importer → typed JSON → activity calculator → UI and audio; marker IDs are independent of place IDs so repeated points cannot multiply activity totals.
- The user explicitly authorizes milestone pushes. No additional push confirmation is needed except host-enforced permissions.

## Progress
- Task 1 complete: original files preserved; data/geometry generated; Python import tests observed failing before implementation and passing 4/4 afterward. Eight roads match original geometry. 59 points + one route cover all 28 places.
