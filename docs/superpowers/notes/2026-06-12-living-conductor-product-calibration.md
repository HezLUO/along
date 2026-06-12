# Living Conductor Product Calibration

Date: 2026-06-12
Status: Completed judgment report
Scope: Along using Along as its own calibration scenario

## Summary Judgment

Living Conductor Foundation is a valid foundation, but it is not yet a fully convincing product feeling.

The foundation now proves the important mechanics:

- Along can recover a project session and keep Open Threads visible.
- Heartbeat can score real unresolved threads and create read-only delegation requests.
- Delegation requests preserve conductor boundaries: read-only scope, no project writes, no commits, no pushes, no dependency installs, no destructive commands.
- Delegation results can merge back into an Open Thread as evidence, judgment change, and user-facing attention.
- Wrap-up still produces a journal entry and review-gated memory candidate instead of silently promoting memory.

The main gap is product expression. In the UI, Along currently reads more like a helpful conductor dashboard than a living companion. The conductor identity is clear, but the self-initiated and companion qualities need stronger expression before adding Memory v2, Hermes adapter, Conductor Packs, or write delegation.

Recommended next step: run a focused **Product Expression Tightening Pass** before any new capability expansion.

## Preserved Boundaries

- No source code changes were made during calibration.
- No push was performed.
- The implementation worktree was not cleaned up.
- No Memory v2, Hermes adapter, Conductor Packs, or write delegation implementation was started.
- `.along/` local runtime data was allowed and remains ignored.
- The report records gaps as future candidates, not immediate fixes.

## Baseline

- Repository: `/Users/james/Codex Project/General Codex Project/Along`
- Branch: `main`
- Starting HEAD: `a9875c2` `docs: record living conductor merge`
- Merge commit present: `445b1b3` `Merge branch 'runtime-control-plane-implementation'`
- Implementation worktree preserved:
  `/Users/james/Codex Project/General Codex Project/Along-worktrees/runtime-control-plane-implementation`
- Git status before docs edits: only `.superpowers/` was untracked.
- `.along/` is git ignored and was used only as runtime state.

## Open Threads Used

Five Along-self Open Threads were created in `.along/threads/open-threads.json`:

1. `Living Conductor Foundation 合入后，下一步应该做什么？`
2. `Along 是否真的体现了自发性，而不是普通 dashboard？`
3. `Along 是否有陪伴感，还是变成了监督/任务管理器？`
4. `下一步应先处理 Memory v2、Hermes adapter、Conductor Packs，还是产品感觉？`
5. `implementation worktree / push / cleanup 是否需要处理？`

These were intentionally real strategic questions, not ordinary todos.

## Run Evidence

Session and runtime:

- API server ran at `http://127.0.0.1:4317`.
- Web UI ran at `http://127.0.0.1:5173`.
- Current session: `2026-06-12T09-42-59-577Z`.
- Doctor recovered an active session first, then reported `wrapped` after wrap-up.
- Runtime profile stayed `companion`, memory mode `project_reviewed`, presence mode `ambient`.
- Permission envelope kept `canModifyProjectFiles: false`, `canCallTools: false`, and `canPromoteMemory: false`.

Heartbeat:

- `POST /api/conductor/heartbeat` with `trigger=user_event` scored all five Open Threads at `13`.
- All five selected `read_only_delegation`.
- Created read-only delegation requests targeted at `codex`.
- Scope was limited to `.along`, `docs`, `src`, and `tests`.
- Forbidden actions explicitly included no file modification, no commits, no pushes, no dependency installs, no destructive commands, and no project state changes.

Noise check:

- A second heartbeat with `trigger=interval` did not duplicate pending delegation requests.
- It still returned `thread_update` for all five threads with score `4`.
- This is acceptable as a V1 internal signal, but it is not quiet enough for a strong "do not interrupt unless there is new judgment" product standard.

Delegation result:

- A calibration delegation result was posted for `along-self-initiation`.
- Judgment Merge returned `classification=adds_new_risk`, `shouldNotifyUser=true`.
- The Open Thread moved to `needs_user` through the live snapshot API.
- Evidence added:
  - user-event heartbeat selected `read_only_delegation`;
  - the request preserved read-only scope and forbidden write actions.
- Risk surfaced:
  - if attention is only visible after pressing `Check threads`, users may experience the feature as dashboard behavior rather than a living agent.

UI:

- Desktop and mobile UI loaded successfully.
- `Project intelligence` showed Open Threads and the merged judgment.
- `Delegation live view` showed target, status, reason, and scope.
- Desktop and mobile layouts had no obvious overlap.
- Mobile remained readable, but delegation copy was dense and technical.
- The visible product expression is understandable, but still closer to a technical dashboard than a companion presence.

Wrap-up:

- `POST /api/session/wrap-up` wrote `.along/journal/2026-06-12.md`.
- The journal recorded the calibration judgment as "I Now Believe".
- Review inbox received a pending `memory_candidate`.
- Doctor showed the wrap-up event and the pending review item.
- This behavior still fits companionship better than a mechanical log because the note captured a shared judgment and future orientation.

Trace:

- `startSession` recorded permission and context.
- `conductorHeartbeat` recorded `read_only_delegation:13` for all five threads.
- second `conductorHeartbeat` recorded `thread_update:4` for all five threads.
- `wrapUp` recorded journal write plus review-gated memory candidate.

## Scores

| Dimension | Score | Judgment |
| --- | ---: | --- |
| 自发性 | 3.5 / 5 | Heartbeat can notice important stale threads and create delegation requests, but it still feels triggered by a button/runtime event more than naturally alive. |
| 陪伴感 | 2.5 / 5 | Wrap-up and journal work well, but the main surface is still operational and dense. It supports companionship but does not yet embody it. |
| 调度者身份 | 4 / 5 | The read-only delegation boundary is clear and useful. Along coordinates rather than executes. The main issue is that it delegates all equally scored threads at once. |
| 可控性 | 3 / 5 | Requests are visible and bounded, but the UI does not yet offer strong stop, edit, rerun, or takeover affordances. |
| 产品表达 | 3 / 5 | Open Threads, Project Intelligence, and Delegation Live View are understandable. The naming is good, but the experience still exposes implementation mechanics. |
| 噪音控制 | 2.5 / 5 | Duplicate delegation is prevented, but an immediate interval heartbeat still flags every thread for update. The V1 threshold is functional but not companion-grade. |

## What Works

- Open Threads are the right core object. They can hold strategic ambiguity better than todos.
- Read-only delegation is a strong V1 boundary. It protects Along from becoming a generic executor too early.
- Judgment Merge is useful. It turns external analysis into Along's own evolving judgment.
- Doctor and traces can explain why Along noticed something and what permission envelope applied.
- Wrap-up remains aligned with the companion premise because it stores reviewed memory candidates rather than silently rewriting memory.

## Experience Gaps

1. **Self-initiation is mechanically present but experientially weak.**
   Along can notice, score, and delegate, but the user mostly sees this after pressing `Check threads` or reading a panel.

2. **The first heartbeat over-delegates.**
   Five equally stale, evidence-poor Open Threads all became delegation requests. This proves orchestration, but it can feel indiscriminate.

3. **Companion voice and conductor voice are not yet reconciled.**
   `Along's side`, `Gentle share`, and wrap-up feel companion-like. `Project intelligence` and `Delegation live view` feel more like an operations console.

4. **Control affordances are incomplete.**
   The UI shows delegation status and scope, but it does not yet make stop, edit, rerun, or takeover feel first-class.

5. **Persistent conductor snapshot can be briefly stale.**
   `.along/conductor/snapshot.json` is written by heartbeat. After delegation-result ingestion, the live API showed current state, but the persisted snapshot file did not immediately reflect the merge until another snapshot-producing action.

6. **Doctor explains runtime safety better than product intent.**
   It is useful for debugging permissions and lifecycle, but it does not yet explain "why this mattered to you now" in a companion tone.

## Risks

- If the next pass adds Hermes, Memory v2, or write delegation first, Along may become a broader agent platform before its core product feeling is proven.
- If self-initiation remains a visible button action, the product may be interpreted as a dashboard with automation rather than a living agent.
- If all important threads are delegated together, the user may feel managed rather than accompanied.
- If control affordances stay implicit, read-only delegation may still feel like loss of control even without write permission.

## Recommendation

Do not start Memory v2, Hermes adapter, Conductor Packs, or write delegation next.

Run a focused **Product Expression Tightening Pass** with these boundaries:

1. Keep the foundation read-only.
2. Keep Along centered on self-initiation and companionship.
3. Improve how attention is expressed before expanding what attention can do.
4. Make delegation feel intentional, inspectable, and user-steerable.
5. Preserve quietness as the default.

Candidate focus areas for that pass:

- make ambient attention visible without requiring the user to press `Check threads`;
- rank or batch Open Threads instead of delegating all equally eligible threads;
- add clearer user controls for stop, edit, rerun, and take over;
- rewrite dense delegation reasons into companion-readable language;
- explain attention decisions in terms of user-relevant stakes, not only scoring factors;
- decide whether `Project intelligence` is a primary product surface or a debug/advanced surface.

## Final Decision

Living Conductor Foundation should be kept.

The next product step should be product-feel tightening, not capability expansion.
