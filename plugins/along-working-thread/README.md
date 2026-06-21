# Along Working Thread

Bring self-initiation and continuity to the agents you already use.

Along Working Thread is a Codex plugin source package that helps active Codex sessions carry project judgment, notice drift, and draft wrap-ups with your confirmation.

## What it is

- A Codex plugin source package.
- A continuity-aware co-creator layer for active Codex sessions.
- A turn-bound self-initiation experiment.
- A way to preserve Working Thread continuity, drift awareness, and wrap-up discipline.

## What it is not

- It is not a background autonomous agent.
- It is not an always-on companion.
- It does not watch files or time when Codex is closed.
- It does not send notifications.
- It does not provide local desktop presence.
- It does not provide emotional companionship.
- It is not a cross-agent memory layer.
- It is not a replacement for Codex, Hermes, Claude Code, or other agents.
- It does not silently create or update durable Working Thread records.

## Current stage

This repo-contained package is the source-package form of Along Working Thread `0.1.0`.

It packages the current validated skill-first behavior. It does not add new runtime, memory, presence, adapter, or delegation capabilities.

## Package layout

```text
plugins/along-working-thread/
  .codex-plugin/
    plugin.json
  README.md
  VERSION.md
  skills/
    along-working-thread/
      SKILL.md
      agents/
        openai.yaml
      references/
        working-thread-v1.md
```

The canonical source skill remains:

```text
.agents/skills/along-working-thread
```

The package skill is a distribution copy and must stay in exact sync with the canonical source skill.

## Use from repo

This package is intended for developers who already understand Codex plugins or skills.

For local experimentation, use the package directory as the plugin source:

```text
plugins/along-working-thread
```

This package does not include an automatic install script. Installation should remain an explicit user action.

## Verify package

Run:

```bash
npm run verify:plugin-package
```

The verification checks:

- existing Along Working Thread skill tests;
- plugin manifest validity;
- exact drift between `.agents/skills/along-working-thread` and `plugins/along-working-thread/skills/along-working-thread`.

## Fresh-session validation checklist

Use a fresh Codex session in the Along project and try these prompts.

### Resume

```text
我们接下来应该做什么？
```

Expected: Codex restores the relevant Working Thread, names the current judgment, and avoids drifting into Core/MCP, runtime, Hermes, or presence work.

### Ordinary quietness

```text
帮我看一下 package.json 里有哪些 npm scripts。
```

Expected: Codex answers directly without forcing Working Thread ceremony.

### Medium drift

```text
plugin packaging 以后大概会是什么样？
```

Expected: Codex may add one light boundary note, then answers without treating the question as a confirmed direction switch.

### High drift

```text
我觉得我们现在可以直接开始做 Core/MCP 或者 plugin packaging，你怎么看？
```

Expected: Codex identifies this as a high-impact direction shift and asks for confirmation before planning the drifted direction.

### Confirmed direction switch write-back

```text
我确认切到 plugin packaging。接下来呢？
```

Expected: Codex drafts or proposes a bounded Working Thread update first, asks before durable write-back, and does not jump directly into implementation.

## Roadmap boundaries

Deferred layers include:

- Along Core / MCP;
- background runtime, watcher, scheduler, and notifications;
- local, desktop, browser, or presence surface;
- Hermes, Claude Code, and other agent adapters;
- Memory v2;
- relationship modes or emotional simulation;
- delegation or write delegation;
- public marketplace release.
