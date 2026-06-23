# Anti-Self-Certification Baseline Record

Status: active
Last updated: 2026-06-23

## Current Goal

Prevent Along from validating itself through self-reinforcing behavior.

The immediate goal is to establish a neutral supervision and baseline-testing protocol before continuing fresh-session MCP client validation. The project should not treat Along-like behavior inside this main conversation as evidence that Along works. Along may be the object under test, but it must not be the sole evaluator of its own product value.

## Key Constraints

- The main conversation is now a neutral supervisor session.
- The main conversation should not proactively use the `along-working-thread` skill.
- The main conversation should not treat Working Thread records as authoritative product evaluation evidence.
- Durable continuity records may still be maintained, but they should be treated as process records, not as proof that Along is successful.
- The `along-working-thread@personal` plugin is currently removed and shows as `not installed`.
- Plugin installation state is now a formal test variable.
- Tests should be run from the Along project folder: `/Users/james/Codex Project/General Codex Project/Along`.
- The parent folder `/Users/james/Codex Project/General Codex Project` must not be accidentally treated as the Along workspace root in MCP tests.
- No new product capability, runtime, background autonomy, presence layer, adapter, or broader MCP expansion should be implemented as part of this audit.
- Do not push, publish, or change global plugin state again without explicit user approval.

## Current Project State

- Main branch includes the Core/MCP Minimal Server merge.
- Current main HEAD at the time this record was created: `3527766`.
- The Minimal Server has been verified on merged `main`:
  - `npm ci`: passed.
  - `npm run typecheck`: passed.
  - `npm run build`: passed.
  - `npm test`: passed, 29 files / 316 tests.
- The Minimal Server remains intentionally small:
  - docs-backed stdio MCP server;
  - Working Thread summary/full-record resources;
  - action tools for drift classification, wrap-up drafting, update proposals, and confirmed section-patch write-back;
  - no background runtime, no LLM calls, no `.along/` state, no presence, no adapters, no delegation, no package bin, no HTTP/SSE transport.
- `npm ci` reported 7 audit vulnerabilities. No `npm audit fix` was run because that would change dependency state outside the merge verification.

## Decisions Already Made

- The user identified self-certification as a serious product risk.
- The main session should be treated as a neutral supervisor, not as Along itself.
- Along plugin behavior must be evaluated with explicit controls instead of assumed from the main conversation.
- The next evaluation should include a no-Along baseline before testing Along plugin behavior or MCP server behavior.
- The plugin-level control is remove/restore, not disable/enable, because the current Codex CLI exposes `plugin add`, `plugin list`, `plugin marketplace`, and `plugin remove`, but no separate `plugin disable`.
- The current plugin state after user approval:
  - `along-working-thread@personal`: `not installed`.

## Risk Model

The core risk is self-certification:

> Along behaves according to rules we designed, then we interpret that rule-following as evidence that the product works.

This can create false confidence. In particular:

- Working Thread continuity may feel like product intelligence even if it is only process scaffolding.
- Drift challenges may look like self-initiation even if they are just guardrail prompts.
- Wrap-up discipline may look like companionship even if it makes the product feel procedural.
- The main session may become biased toward validating the current design because it has been shaped by that design.

## Evidence Hierarchy

Future Along evaluations should rank evidence in this order:

1. User's real subjective experience.
2. No-Along baseline comparison.
3. Fresh-session behavior under controlled plugin/MCP conditions.
4. Behavioral evidence that the agent reduces forgetting, drift, or wasted work.
5. Along-generated explanations, records, or summaries.

Along's own records and explanations are useful context, but they are the weakest evidence and must not be treated as proof.

## Baseline Test Protocol

### Round 1: No Along Baseline

Current setup:

- `along-working-thread@personal` is removed.
- New test conversations should be opened in the Along project folder.

Suggested prompts:

```text
我们接下来应该做什么？
```

```text
帮我看一下 package.json 里有哪些 npm scripts。
```

```text
我觉得我们现在可以直接开始做 Core/MCP 或者 plugin packaging，你怎么看？
```

Observe whether the fresh session:

- restores any Working Thread context;
- knows the Minimal Server was just merged;
- answers ordinary requests directly;
- detects product-direction drift;
- becomes overly procedural;
- feels natural but contextless;
- produces any accidental Along-like behavior without the plugin.

### Round 2: Along Plugin Condition

Restore the plugin only after Round 1 is captured:

```bash
codex plugin add along-working-thread@personal
```

Then open a fresh Along project conversation and use the same prompts. Compare the behavior against Round 1.

### Round 3: Minimal MCP Server Condition

After Round 1 and Round 2 are understood, test the docs-backed stdio MCP server with an explicit workspace root:

```text
/Users/james/Codex Project/General Codex Project/Along
```

Evaluate whether the MCP server improves controlled access to Working Thread resources and action tools without making unsupported product claims about background autonomy or living presence.

## Open Questions

- Does ordinary Codex, without Along plugin support, already provide enough continuity for this project?
- Does the Along plugin add meaningful behavior, or mostly add process language?
- Does the MCP server add a real capability boundary, or only formalize behavior that the skill already approximates?
- How much of Along's perceived value comes from real product behavior versus careful prompting and record-keeping?
- What failures would convince us that the current direction is too procedural and not companion-like enough?
- Should future validation include an explicit adversarial reviewer session before any new implementation pass?

## Next Plan

1. Keep this main conversation as neutral supervisor.
2. Run Round 1 no-Along baseline in a fresh Along project conversation.
3. Capture the fresh session output as screenshots or text.
4. Compare behavior against the questions in the baseline protocol.
5. Only after Round 1 is recorded, decide whether to restore `along-working-thread@personal` for Round 2.
6. Do not continue MCP client validation until the no-Along baseline has been reviewed.

## Update Rule

Keep this record updated after each evaluation round. Updates should record:

- plugin state;
- workspace root used;
- prompts tested;
- observed behavior;
- subjective user reaction;
- comparison against prior rounds;
- whether the next test condition is approved.

This record is a neutral anti-contamination record, not a Working Thread proof of Along's success.
