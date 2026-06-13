# Product Expression Post-Merge Calibration

Date: 2026-06-13
Status: Completed post-merge judgment report
Scope: Product Expression Tightening after local merge to `main`

## Summary Judgment

Product Expression Tightening should stay merged.

The Shared Desk pass materially improves Along's product feeling. The first read is no longer "here are conductor modules"; it is closer to "this is what we are holding together right now." That is a better match for Along's intended identity: self-initiated companion plus read-only conductor.

It is not fully "living companion" yet. The experience is closer than before, but three gaps remain:

- resumed sessions can show an old project snapshot without making its age visible;
- `Ask why` is still a lightweight action rather than a real explanation surface;
- Along's chosen curiosity remains generic compared with the richer Open Thread judgment shown below it.

Recommended next step: keep this pass, do not start Memory v2 or Hermes adapter immediately, and use the next design pass to tighten lived presence, explanation, and resumed-session freshness.

## Preserved Boundaries

- Product Expression Tightening was merged locally only.
- No push was performed.
- The focused execution worktree was not cleaned up.
- No source changes were made during this calibration report.
- No Memory v2, Hermes adapter, Conductor Packs, write delegation, LLM attention judgment, Living Desktop, or Ambient Presence implementation was started.
- `.along/` runtime data was allowed and remains ignored.

## Baseline

- Repository: `/Users/james/Codex Project/General Codex Project/Along`
- Branch: `main`
- Product Expression merge commit: `a829be6` `Merge branch 'product-expression-tightening'`
- Product Expression implementation branch: `product-expression-tightening`
- Focused execution worktree preserved:
  `/Users/james/Codex Project/General Codex Project/Along-worktrees/product-expression-tightening`
- Git status before docs edits: only `.superpowers/` was untracked, plus ignored `.along/` runtime data.

## Merge Verification

Verification on merged `main`:

- `npm test -- tests/web/shared-desk-model.test.ts` passed: 1 file, 6 tests.
- `npm run typecheck` passed.
- `npm run build` passed.
- Full `npm test` failed in the sandbox only because Express server tests hit `listen EPERM`, then passed after sandbox escalation: 22 files, 231 tests.

## Calibration Run Evidence

Runtime:

- API server ran at `http://127.0.0.1:4317`.
- Web UI ran at `http://127.0.0.1:5173`.
- Browser inspection reported zero console errors on desktop and mobile.
- Mobile viewport `390x844` had no horizontal overflow.

Desktop recovered-session observation:

- Shared Desk loaded as the first product surface.
- `Project intelligence` and `Delegation live view` were visible as closed secondary `<details>` surfaces.
- `Along's side` showed one dominant judgment and two watch threads.
- `Check gently` updated the conductor judgment without crashing or opening noisy panels.
- A recovered session initially showed older git commits from the previous session snapshot.

Fresh-session observation:

- `POST /api/session/start` created a fresh session and correctly read the post-merge commit:
  `a829be6 Merge branch 'product-expression-tightening'`.
- Reloaded UI showed the fresh merge commit in `Your side`.
- Shared Desk remained first; secondary panels remained folded.

Wrap-up:

- The wrap-up control wrote `.along/journal/2026-06-13.md`.
- The note captured a real calibration judgment:
  Shared Desk feels closer to a living companion because Along holds one judgment first and keeps delegation secondary.
- The journal also captured the remaining concern:
  resumed sessions can show stale project snapshots without making that age visible.

Mobile:

- Shared Desk began at the top of the mobile viewport.
- Document width matched client width; no horizontal overflow.
- `Project intelligence` and `Delegation live view` remained collapsed.
- The merge commit, main judgment, and watch threads were readable without obvious overlap.

## Scores

| Dimension | Score | Judgment |
| --- | ---: | --- |
| 自发性 | 3.8 / 5 | Along now chooses a main judgment and watch threads, but the felt self-initiation still depends on visible UI refresh and heartbeat actions. |
| 陪伴感 | 3.4 / 5 | Shared Desk and wrap-up feel more companion-like than the old dashboard. Generic curiosity and stale resume cues still weaken the feeling. |
| 调度者身份 | 4.2 / 5 | Delegation is clearly secondary, read-only, and bounded. Along feels more like a conductor than an executor. |
| 可控性 | 3.2 / 5 | `Not now`, `Hide`, and `Make this main` are useful V1 controls, but they are session-local and explanation is still shallow. |
| 产品表达 | 4.0 / 5 | The product now leads with shared context and judgment instead of implementation modules. This is the biggest improvement. |
| 噪音控制 | 3.0 / 5 | Secondary panels default closed and watch threads are limited. The system still needs better cues for when old resumed information is stale. |

## What Improved

1. **First impression shifted from dashboard to shared workspace.**
   The page now starts with `Your side` and `Along's side`, which better expresses companionship than `Project intelligence` as the primary object.

2. **Along's judgment is easier to see.**
   One dominant judgment plus watch threads communicates prioritization better than a flat list of Open Threads.

3. **Delegation no longer dominates the page.**
   `Delegation live view` remains available, but it does not define the first impression.

4. **Read-only conductor boundary is still visible.**
   The UI still exposes target, status, scope, and forbidden actions without granting write control.

5. **Wrap-up still carries shared judgment.**
   The journal write felt like memory of a shared observation, not just a raw event log.

## Remaining Experience Gaps

1. **Recovered sessions need freshness cues.**
   A recovered session can show old git context while the repo has moved on. Fresh session start reads the correct state, but the UI does not make the recovered snapshot age clear.

2. **`Ask why` needs to become a real explanation surface.**
   The button is acceptable for V1 wiring, but it should eventually reveal why Along chose this thread, what evidence changed, and why it is not interrupting more aggressively.

3. **The generic curiosity competes with richer Open Thread judgment.**
   `What is the smallest useful entry point in Along?` is calm, but after Product Expression work it feels less specific than the Open Thread judgment Along is already carrying.

4. **User overrides are not yet durable.**
   `Not now`, `Hide`, and `Make this main` are useful controls, but they are not yet a lasting preference or memory signal.

5. **Living presence is still mostly layout, not behavior.**
   The Shared Desk improves expression, but the next leap should come from presence, explanation, and freshness behavior rather than more panels.

## Risks

- If Memory v2 or Hermes adapter starts next, Along may regain capability breadth before the living-companion feeling is stable.
- If recovered-session freshness remains unclear, users may trust stale project state.
- If `Ask why` remains shallow, users may not understand Along's self-initiation.
- If controls remain session-local, Along may feel polite in the moment but not meaningfully adaptive over time.

## Recommendation

Keep Product Expression Tightening merged.

Do not start broad capability expansion next.

Recommended next design topic:

**Living Presence and Explanation Pass**

Candidate scope:

- add freshness/age cues for resumed project snapshots;
- make `Ask why` reveal a small explanation of attention, evidence, delegation state, and silence choice;
- make the main curiosity derive from the chosen Open Thread when one exists;
- decide whether `Not now`, `Hide`, and `Make this main` should become durable user preference signals;
- keep this as product-expression behavior, not Memory v2 or Hermes adapter implementation.

## Final Decision

Product Expression Tightening successfully moved Along closer to the desired "living companion + conductor" identity.

The next step should continue tightening lived presence and explanation before expanding execution capability.
