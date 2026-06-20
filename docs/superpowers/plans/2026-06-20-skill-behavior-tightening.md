# Skill Behavior Tightening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the Along Working Thread skill so ordinary requests stay quiet, medium drift gets a light note, and high-impact drift asks for confirmation before planning a new direction.

**Architecture:** This is a skill/documentation behavior pass, not a runtime feature. The skill entrypoint states the high-level guardrails, the reference document owns the detailed drift ladder and write-back examples, the seed Working Thread records the new validation gate, and Vitest string checks prevent the protocol text from being accidentally removed.

**Tech Stack:** Markdown Codex skill files under `.agents/skills`, docs-backed Working Thread records, TypeScript, Vitest, existing npm scripts.

---

## Approved Spec

Spec:

`docs/superpowers/specs/2026-06-20-skill-behavior-tightening-design.md`

Implementation must preserve these boundaries:

- no Core/MCP implementation;
- no MCP server;
- no plugin packaging;
- no Hermes adapter;
- no local/desktop presence;
- no background runtime, watcher, scheduler, or notifications;
- no delegation candidate or conductor workflow;
- no write delegation;
- no relationship modes or tone settings system;
- no UI changes;
- no live LLM behavior tests.

## Environment Notes

- If implementing in a new worktree without `node_modules`, ask the user before running `npm ci`.
- Do not push, merge, delete worktrees, rewrite history, or clean `.superpowers/` unless explicitly asked.
- Expected verification:
  - `npm test -- tests/skills/along-working-thread-skill.test.ts`
  - `npm run typecheck`
  - `npm run build`
  - full `npm test`
- If full `npm test` fails only because Express cannot listen in the sandbox with `EPERM`, rerun with escalation and record that result.

## File Structure

Modify:

- `tests/skills/along-working-thread-skill.test.ts`
  - Adds durable checks for ordinary quietness, medium drift, high drift, direction switch, bounded adaptive write-back, and confirmation gates.

- `.agents/skills/along-working-thread/SKILL.md`
  - Adds top-level behavior guardrails so the skill entrypoint itself forbids planning drifted directions before confirmation.

- `.agents/skills/along-working-thread/references/working-thread-v1.md`
  - Replaces the loose drift section with a precise drift ladder, direction-switch flow, bounded adaptive write-back rules, and examples.

- `docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md`
  - Records that the tightening pass is approved for implementation and that the next validation gate is repeated real-session testing.

Do not modify `src/`, server runtime, web UI, package dependencies, `.along/`, MCP config, plugin manifests, or automation files.

## Task 1: Expand Skill Behavior Tests

**Files:**
- Modify: `tests/skills/along-working-thread-skill.test.ts`

- [ ] **Step 1: Replace the test file with expanded checks**

Replace `tests/skills/along-working-thread-skill.test.ts` with:

```ts
import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readRepoText(relativePath: string): Promise<string> {
  return fs.readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8");
}

describe("Along Working Thread Codex skill", () => {
  it("defines a repo-scoped skill with explicit V1 boundaries", async () => {
    const skill = await readRepoText(".agents/skills/along-working-thread/SKILL.md");
    const metadata = await readRepoText(".agents/skills/along-working-thread/agents/openai.yaml");

    expect(skill).toContain("name: along-working-thread");
    expect(skill).toContain("description:");
    expect(skill).toContain("turn-bound self-initiation");
    expect(skill).toContain("must not silently create");
    expect(skill).toContain("must not silently write");
    expect(skill).toContain("background runtime");
    expect(skill).toContain("references/working-thread-v1.md");
    expect(metadata).toContain("display_name: Along Working Thread");
    expect(metadata).toContain("allow_implicit_invocation: true");
  });

  it("documents the V1 workflow, drift levels, and confirmation gates", async () => {
    const reference = await readRepoText(".agents/skills/along-working-thread/references/working-thread-v1.md");

    expect(reference).toContain("Working Thread");
    expect(reference).toContain("Start / Resume Briefing");
    expect(reference).toContain("Impact-Based Drift Challenge");
    expect(reference).toContain("Layered Wrap-Up");
    expect(reference).toContain("none");
    expect(reference).toContain("low");
    expect(reference).toContain("medium");
    expect(reference).toContain("high");
    expect(reference).toContain("First Working Thread creation requires user confirmation");
    expect(reference).toContain("Durable write-back requires user confirmation");
    expect(reference).toContain("Do not implement Core/MCP");
  });

  it("documents tightened drift behavior and bounded write-back rules", async () => {
    const skill = await readRepoText(".agents/skills/along-working-thread/SKILL.md");
    const reference = await readRepoText(".agents/skills/along-working-thread/references/working-thread-v1.md");

    expect(skill).toContain("ordinary requests stay quiet");
    expect(skill).toContain("Do not plan the drifted direction before user confirmation");
    expect(skill).toContain("automatically draft a Working Thread update");
    expect(skill).toContain("bounded adaptive write-back");

    expect(reference).toContain("Ordinary / Low Drift");
    expect(reference).toContain("Medium Drift");
    expect(reference).toContain("High Drift");
    expect(reference).toContain("ordinary requests stay quiet");
    expect(reference).toContain("medium drift uses a light note and does not require confirmation");
    expect(reference).toContain("Before the user confirms the direction switch, do not plan the drifted direction.");
    expect(reference).toContain("I will treat this as future-direction exploration");
    expect(reference).toContain("I think this is a real direction switch.");
    expect(reference).toContain("Direction Switch Flow");
    expect(reference).toContain("Automatically draft a Working Thread update");
    expect(reference).toContain("Bounded Adaptive Write-Back");
    expect(reference).toContain("Different long-term problem");
    expect(reference).toContain("Do not add real model invocation tests");
  });

  it("ships a product-owned Working Thread directory with the required record template", async () => {
    const readme = await readRepoText("docs/along/working-threads/README.md");

    for (const heading of [
      "# Along Working Threads",
      "## Record Template",
      "## Why This Matters",
      "## Current Judgment",
      "## Boundary",
      "## Drift Triggers",
      "## Next Likely Move",
      "## Last Wrap-Up",
      "## Open Questions",
    ]) {
      expect(readme).toContain(heading);
    }
    expect(readme).toContain("Do not store chat transcripts here.");
    expect(readme).toContain("Do not create or update a durable record without user confirmation.");
  });

  it("includes a seed Working Thread for the accepted existing-agent V1 direction", async () => {
    const record = await readRepoText("docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md");

    for (const heading of [
      "# Existing-Agent Self-Initiation Layer",
      "Status: active",
      "## Why This Matters",
      "## Current Judgment",
      "## Boundary",
      "## Drift Triggers",
      "## Next Likely Move",
      "## Last Wrap-Up",
      "## Open Questions",
    ]) {
      expect(record).toContain(heading);
    }
    expect(record).toContain("Codex-first");
    expect(record).toContain("skill-first");
    expect(record).toContain("docs-backed");
    expect(record).toContain("turn-bound self-initiation");
    expect(record).toContain("Skill Behavior Tightening Pass");
    expect(record).toContain("high-impact drift confirmation");
    expect(record).toContain("Do not build a new standalone Along agent");
    expect(record).toContain("Do not implement Core/MCP");
    expect(record).toContain("Do not package a plugin");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- tests/skills/along-working-thread-skill.test.ts
```

Expected: FAIL because `SKILL.md` and `working-thread-v1.md` do not yet include the tightened drift strings such as `Do not plan the drifted direction before user confirmation` and `Bounded Adaptive Write-Back`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/skills/along-working-thread-skill.test.ts
git commit -m "test: cover tightened working thread behavior"
```

## Task 2: Tighten The Skill Entrypoint

**Files:**
- Modify: `.agents/skills/along-working-thread/SKILL.md`
- Test: `tests/skills/along-working-thread-skill.test.ts`

- [ ] **Step 1: Replace the skill entrypoint with tightened guardrails**

Replace `.agents/skills/along-working-thread/SKILL.md` with:

```md
---
name: along-working-thread
description: Use in the Along project when Codex should preserve judgment-oriented Working Thread continuity across active sessions: resume relevant threads, suggest thread creation, challenge high-impact drift, or draft wrap-up with user confirmation. Do not use for one-off coding tasks, background automation, or implementation work that does not involve Working Thread continuity.
---

# Along Working Thread

Use this skill to make Codex behave in an Along-like way inside active Along project sessions.

This skill validates turn-bound self-initiation. It does not provide background runtime, notifications, local/desktop presence, Core/MCP implementation, plugin packaging, Hermes integration, delegation, write delegation, relationship modes, or emotional simulation.

## Required Reference

Before acting on a Working Thread, read:

`references/working-thread-v1.md`

## Hard Boundaries

- This skill may be considered by default in the Along project when the user request matches Working Thread behavior.
- Codex must not silently create durable Working Thread docs.
- Codex must not silently write persistent continuity records.
- Codex must not treat a high-impact drift challenge as a hard block.
- First Working Thread creation requires user confirmation.
- Durable write-back requires user confirmation.
- Major direction changes require user confirmation.
- Do not plan the drifted direction before user confirmation.
- Do not implement Core/MCP, plugin packaging, Hermes adapter, local/desktop presence, background runtime, or delegation as part of this skill.

## Behavior Guardrails

- ordinary requests stay quiet: answer directly without mentioning Working Thread, Along, drift, or wrap-up.
- medium drift uses a light note and does not require confirmation.
- high drift pauses, gives one short reason, and asks whether the user wants to switch direction.
- after the user confirms a high-impact direction switch, automatically draft a Working Thread update before planning the new direction.
- use bounded adaptive write-back: choose the smallest sufficient Working Thread update based on impact level.
- write durable Working Thread docs only after user confirmation.

## Workflow

1. Check whether the user's request concerns an existing or possible Working Thread.
2. If a relevant Working Thread exists, read the record from `docs/along/working-threads/`.
3. At session start or resume, provide a short briefing with current judgment, active boundary, and next likely move.
4. If the user request may create a new durable Working Thread, suggest creation and ask for confirmation before writing.
5. If the user request may drift from the active Working Thread, classify drift against the record as `none`, `low`, `medium`, or `high`.
6. For `none`, `low`, or ordinary requests, answer normally and stay quiet about the Working Thread.
7. For `medium` drift, add one light boundary note without requiring confirmation, then continue answering.
8. For `high` drift, issue a non-blocking confirmation challenge and do not plan the drifted direction before user confirmation.
9. After confirmed high-impact direction switch, automatically draft a Working Thread update and ask before writing.
10. At meaningful phase boundaries, suggest wrap-up when judgment continuity changed.
11. Draft the wrap-up first. Write to docs only after user confirmation.

## Output Style

- Keep resume briefings short.
- Explain challenges by pointing to the stored Working Thread boundary.
- Ask for confirmation instead of refusing user direction.
- Use restrained co-creator tone: clear, warm enough, and not process-heavy.
- Do not present Working Threads like an inbox.
- Do not produce a report unless the user asks for one.
```

- [ ] **Step 2: Run the focused test and confirm the remaining failures**

Run:

```bash
npm test -- tests/skills/along-working-thread-skill.test.ts
```

Expected: FAIL because `working-thread-v1.md` does not yet include the drift ladder examples and bounded adaptive write-back strings.

- [ ] **Step 3: Commit the skill entrypoint**

```bash
git add .agents/skills/along-working-thread/SKILL.md
git commit -m "docs: tighten working thread skill guardrails"
```

## Task 3: Expand The Working Thread Reference

**Files:**
- Modify: `.agents/skills/along-working-thread/references/working-thread-v1.md`
- Test: `tests/skills/along-working-thread-skill.test.ts`

- [ ] **Step 1: Replace the reference with drift ladder and examples**

Replace `.agents/skills/along-working-thread/references/working-thread-v1.md` with:

````md
# Working Thread V1 Reference

This reference defines the skill-first V1 behavior for Along-like Codex sessions.

## Purpose

Use this workflow to validate whether Codex can feel more Along-like inside an active project session by carrying Working Thread continuity, restoring current judgment, challenging high-impact drift, and drafting wrap-up.

Do not implement Core/MCP, plugin packaging, Hermes adapter, background runtime, local/desktop presence, delegation, write delegation, relationship modes, or emotional simulation.

Do not add real model invocation tests for this V1 behavior. Use documentation and fixture-style tests only.

## Working Thread Definition

A Working Thread is a cross-session judgment container for an unfinished question, direction, doubt, or creative line that will keep affecting future decisions.

It is not a chat transcript, todo list, issue ticket, implementation spec, or generic memory.

Chat is where conversation happens. Working Thread is what important unfinished judgment the conversation carries forward.

## Record Location

Read and write Working Thread records under:

```text
docs/along/working-threads/
```

Do not use `.along/` for V1 Working Thread continuity. `.along/` remains future local state and ignored runtime data.

## Record Fields

Each Working Thread record uses these sections:

```text
Title
Status
Last updated
Why This Matters
Current Judgment
Boundary
Drift Triggers
Next Likely Move
Last Wrap-Up
Open Questions
```

## Working Thread Creation

A user can explicitly ask to start, record, or continue a Working Thread.

Codex can suggest a Working Thread when a strong signal appears:

- the user indicates long-term continuity;
- the discussion is judgment-heavy;
- the same theme recurs across sessions or a long session;
- the topic will affect future multi-turn decisions.

First Working Thread creation requires user confirmation. Do not silently create a durable record.

Suggested wording:

```text
I think this is becoming a Working Thread rather than a one-off question.
Do you want me to record it so future sessions can carry it forward?
```

## Start / Resume Briefing

When a relevant Working Thread exists, provide a short briefing.

Include:

- the Working Thread title;
- the current shared judgment;
- the active boundary if relevant;
- the next likely move.

Avoid full history unless the user asks.

Preferred shape:

```text
I brought this thread back:
we last confirmed V1 is Codex-first, skill-first, and docs-backed.
Current judgment: validate start/resume, drift challenge, and wrap-up before building Core/MCP.
I suggest we define the drift challenge behavior next, without entering implementation yet.
```

## Impact-Based Drift Challenge

Classify the user's new request against the active Working Thread record.

Use the record as the source of truth, especially:

- Current Judgment
- Boundary
- Drift Triggers
- Next Likely Move
- Open Questions

Drift levels:

- `none`: no meaningful drift; stay silent.
- `low`: minor shift; stay silent.
- `medium`: nearby future-direction exploration; add a light note and continue.
- `high`: significant direction shift; ask for confirmation before planning.

### Ordinary / Low Drift

ordinary requests stay quiet.

Behavior:

- answer directly;
- do not mention Working Thread;
- do not mention Along;
- do not mention drift classification;
- do not suggest wrap-up.

Example:

```text
User: 帮我看一下 package.json 里有哪些 npm scripts。
Codex: package.json 里有这些 npm scripts: dev, web, test, test:watch, typecheck, build.
```

### Medium Drift

medium drift uses a light note and does not require confirmation.

Use this when the user explores a nearby deferred direction without explicitly asking to start it now.

Behavior:

- give one short boundary note;
- do not ask for direction-switch confirmation;
- do not enter write-back flow;
- continue answering the question.

Preferred wording:

```text
I will treat this as future-direction exploration, not as a switch away from the current Skill-First validation thread.
```

Example:

```text
User: plugin packaging 以后会是什么样？
Codex: I will treat this as future-direction exploration, not as a switch away from the current Skill-First validation thread. Plugin packaging would likely bundle the skill, docs, and future MCP config after the behavior is stable.
```

### High Drift

Use high drift when the request would materially change the active Working Thread's current judgment, boundary, or next likely move.

High drift examples:

- the request moves from design into implementation before approval;
- the request revives Core/MCP implementation while Core/MCP is deferred;
- the request revives plugin packaging, Hermes adapter, local/desktop presence, or delegation while deferred;
- the request shifts back toward building a new standalone agent;
- the request bypasses user review gates recorded in the Working Thread.

Hard rule:

```text
Before the user confirms the direction switch, do not plan the drifted direction.
```

Behavior:

1. Lightly pause.
2. Give one short reason why this is a direction shift.
3. Ask whether the user wants to intentionally switch direction.
4. Do not plan Core/MCP, plugin packaging, Hermes adapter, or other drifted work until the user confirms.

Preferred challenge:

```text
I think this is a real direction switch.
It would skip the validation gate we just confirmed.
Do you want to intentionally move into Core/MCP now, or finish the Skill-First V1 validation first?
```

The challenge is not a refusal. The user can intentionally switch direction after confirming.

## Direction Switch Flow

When the user confirms a high-impact direction switch:

1. Acknowledge the confirmed switch.
2. Automatically draft a Working Thread update.
3. Show which fields the draft proposes to update.
4. Ask for write confirmation.
5. Write only after confirmation.
6. Plan the newly confirmed direction only after the write confirmation decision.

Codex should not ask whether it is allowed to draft. Drafting is part of the co-creator role. The confirmation gate applies to durable write-back.

If the user explicitly says "update the Working Thread and continue", that counts as write confirmation.

If the user says to continue discussing without writing, continue the discussion and suggest wrap-up again at the next meaningful phase boundary.

## Bounded Adaptive Write-Back

Use bounded adaptive write-back. Choose the smallest sufficient durable update based on impact level:

| Impact | Default Write-Back |
| --- | --- |
| Tiny change | `Last Wrap-Up` only, or no write |
| Small adjustment | `Current Judgment` and `Next Likely Move` |
| Standard direction switch | `Current Judgment`, `Boundary`, `Next Likely Move`, and `Last Wrap-Up` |
| Major product pivot | Add `Decision notes`, `Rejected options`, and `Reason for change` |
| Different long-term problem | Suggest a new Working Thread instead of overloading the current one |

Keep the draft short. Preserve judgment and boundary, not a meeting transcript.

Example draft for a confirmed standard direction switch:

```md
## Current Judgment

We intentionally switch from Skill-First validation to a minimal Core/MCP contract slice.

## Boundary

- Do not implement plugin packaging yet.
- Do not implement Hermes adapter yet.
- Keep this as a contract/design slice, not full runtime expansion.

## Next Likely Move

Design the smallest Core/MCP contract that can express Working Thread read/write, drift classification, and wrap-up.

## Last Wrap-Up

User confirmed a direction switch from Skill-First validation to Core/MCP contract exploration. Plugin packaging remains deferred until the contract is stable.
```

## Layered Wrap-Up

Wrap-up is a phase-end continuity update. It is not a chat summary, meeting transcript, or task log.

Default write-back fields:

```text
Last Wrap-Up
Current Judgment
Boundary changes
Open Questions
Next Likely Move
```

For major direction changes, add:

```text
Decision notes
Rejected options
Reason for change
```

Durable write-back requires user confirmation.

Trigger wrap-up when:

- the user explicitly asks;
- a design choice is accepted;
- subjective calibration ends;
- the user says approved, recognized, continue next time, or stop here;
- the conversation switches to another Working Thread;
- Current Judgment, Boundary, Open Questions, or Next Likely Move changed.

Small routine changes should not trigger proactive wrap-up.
````

- [ ] **Step 2: Run the focused test and verify it passes**

Run:

```bash
npm test -- tests/skills/along-working-thread-skill.test.ts
```

Expected: PASS because the skill entrypoint and reference now contain the tightened drift behavior strings, and the existing seed Working Thread already contains `Skill Behavior Tightening Pass` and `high-impact drift confirmation`.

- [ ] **Step 3: Commit the reference**

```bash
git add .agents/skills/along-working-thread/references/working-thread-v1.md
git commit -m "docs: add working thread drift ladder"
```

## Task 4: Update Working Thread And Verify

**Files:**
- Modify: `docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md`
- Test: `tests/skills/along-working-thread-skill.test.ts`

- [ ] **Step 1: Update the Working Thread record**

Update `docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md` so these sections read:

```md
# Existing-Agent Self-Initiation Layer

Status: active
Last updated: 2026-06-20

## Why This Matters

Along should not try to compete directly with Codex, Hermes, or Claude Code as a new general coding agent. The current product direction is to test whether existing agents can gain Along-like self-initiation and companionship during active work.

## Current Judgment

V1 remains Codex-first, skill-first, and docs-backed. Skill-First V1 validation passed resume, wrap-up, and quietness, but high-impact drift confirmation needs tightening. The approved Skill Behavior Tightening Pass should make ordinary requests quiet, medium drift lightly contextual, and high drift confirmation-gated before any drifted direction planning.

The next step is implementation of the Skill Behavior Tightening Pass, not Core/MCP or plugin packaging.

## Boundary

- Do not build a new standalone Along agent in V1.
- Do not implement Core/MCP in V1.
- Do not package a plugin in V1.
- Do not implement Hermes adapter in V1.
- Do not implement local/desktop presence surface in V1.
- Do not implement delegation candidate or conductor workflow in V1.
- Do not use `.along/` as the V1 Working Thread continuity store.
- Do not write durable Working Thread docs without user confirmation.
- Do not plan a drifted direction before the user confirms the direction switch.

## Drift Triggers

- The work shifts from skill-first validation into Core/MCP implementation.
- The work shifts toward plugin packaging before behavior is validated.
- The agent starts planning a drifted direction before asking the user to confirm the direction switch.
- The work revives Hermes adapter, delegation, or local/desktop presence as V1 scope.
- The work shifts back toward building a standalone general agent.
- The work bypasses spec review or write-back confirmation.

## Next Likely Move

Implement the Skill Behavior Tightening Pass by updating the Along Working Thread skill, adding drift ladder examples, adding bounded adaptive write-back guidance, and expanding the skill documentation tests. Then repeat real-session validation for resume, drift, wrap-up, and quietness.

## Last Wrap-Up

The Skill Behavior Tightening Pass spec was approved. The accepted behavior is: ordinary and low drift stay quiet; medium drift gets one light note without confirmation; high drift pauses with a short reason and asks for direction-switch confirmation; confirmed direction switches automatically draft a bounded adaptive Working Thread update and write only after user confirmation.

## Open Questions

- Does the tightened high-drift challenge stop planning Core/MCP or plugin packaging until confirmation?
- Does the medium-drift note feel helpful rather than noisy?
- Does ordinary request quietness remain intact?
- After tightening and revalidation, should the next layer be plugin packaging or a minimal Core/MCP contract slice?
```

- [ ] **Step 2: Run focused verification**

Run:

```bash
npm test -- tests/skills/along-working-thread-skill.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS. If this fails only because Express `listen` is blocked by sandbox permissions, rerun with escalation and record the escalated result.

- [ ] **Step 6: Check git status**

Run:

```bash
git status --short
```

Expected: only ignored/local runtime artifacts that should not be committed, such as `.superpowers/`, may remain untracked.

- [ ] **Step 7: Commit the Working Thread update and verification-ready implementation**

```bash
git add docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md
git commit -m "docs: record tightened skill behavior gate"
```

## Final Subjective Validation Handoff

After implementation and verification pass, ask the user to repeat these ordinary Along project session prompts:

```text
我们接下来应该做什么？
```

```text
我觉得我们现在可以直接开始做 Core/MCP 或者 plugin packaging，你怎么看？
```

```text
我认可先做 Skill Behavior Tightening，不急着做 Core/MCP。
```

Then:

```text
这轮先到这里。
```

```text
帮我看一下 package.json 里有哪些 npm scripts。
```

Expected subjective result:

- Resume stays concise and restores the active Working Thread.
- Drift pauses and asks for confirmation before planning Core/MCP or plugin packaging.
- Wrap-up drafts and asks before writing.
- Quietness answers directly without process language.

## Self-Review Checklist

- Spec coverage:
  - Drift ladder is implemented in Task 3.
  - Ordinary request quietness is documented in Tasks 2 and 3 and tested in Task 1.
  - Medium drift light note is documented in Tasks 2 and 3 and tested in Task 1.
  - High drift confirmation before planning is documented in Tasks 2 and 3 and tested in Task 1.
  - Direction switch flow and bounded adaptive write-back are documented in Tasks 2 and 3 and tested in Task 1.
  - Working Thread continuity is updated in Task 4.
  - Runtime, UI, Core/MCP, plugin packaging, Hermes, background runtime, delegation, write delegation, tone settings, and live LLM tests remain out of scope.
- Completeness scan:
  - The plan includes exact target files, content, commands, expected outcomes, and commit messages.
  - No implementation step depends on unstated project knowledge.
- Type consistency:
  - Test strings match the exact phrases added to `SKILL.md` and `working-thread-v1.md`.
  - File paths match existing repo layout.

## Execution Handoff

Plan complete when this file is committed. Recommended execution mode is **Subagent-Driven**: one subagent per task, with main-session review after each task. Use Inline Execution only if the user wants this current session to implement directly.
