# Along Core/MCP Minimal Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real but minimal docs-backed stdio MCP server for Along Working Threads without adding background runtime, HTTP/SSE transport, `.along/` state, LLM calls, prompts, adapters, delegation, or full-file write behavior.

**Architecture:** Keep `src/core/working-thread-contract.ts` as the pure contract layer. Add `src/mcp/` for Markdown parsing, docs-backed Working Thread file access, action-only operation handlers, and the stdio MCP server adapter. Expose read/list behavior through MCP resources and expose only judgment/write-back actions through MCP tools.

**Tech Stack:** TypeScript strict mode, Vitest, Node.js `fs/promises`, existing `tsx` runner, standard MCP TypeScript SDK, Zod >= 3.25 for SDK-compatible schemas.

---

## Current Constraints

- Base branch: `main`.
- Approved spec: `docs/superpowers/specs/2026-06-21-along-core-mcp-minimal-server-design.md`.
- Existing contract: `src/core/working-thread-contract.ts`.
- Existing contract test: `tests/core/working-thread-contract.test.ts`.
- Do not use `.along/` as the Working Thread store.
- Do not add HTTP/SSE transport, local ports, daemon behavior, background runtime, watcher, scheduler, notification, presence, adapters, Memory v2, relationship modes, delegation, or write delegation.
- Do not expose MCP prompts.
- Do not call an LLM or require an API key.
- Do not add a package bin or formal CLI.
- Do not rewrite whole Working Thread Markdown files.
- Do not write outside `docs/along/working-threads/`.
- Preserve `.superpowers/` as untracked local runtime data.
- Any new npm dependency requires explicit user approval before installation or `package.json`/`package-lock.json` changes.

## SDK Reference Notes

Checked on 2026-06-22:

- V1 TypeScript SDK docs install with `npm install @modelcontextprotocol/sdk zod`.
- The SDK docs describe stdio as the local process-spawned transport.
- The SDK docs show `McpServer` from `@modelcontextprotocol/sdk/server/mcp.js`.
- The SDK docs show `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`.
- The SDK docs state `zod` is a required peer dependency and that Zod v3.25 or later is compatible.

Use `@modelcontextprotocol/sdk` plus `zod@^3.25.0` unless implementation-time official docs or installed types prove a different package is required. If the package choice changes, stop and explain the reason before installing.

## File Structure

- Modify `package.json`
  - Add `mcp:working-thread` npm script.
  - Add approved MCP SDK dependency.
  - Bump `zod` to a SDK-compatible version if needed.
- Modify `package-lock.json`
  - Let npm update this after approved dependency installation.
- Create `src/mcp/working-thread-markdown.ts`
  - Parse Working Thread Markdown into contract-shaped records.
  - Produce summaries.
  - Produce parse warnings for malformed records.
  - Apply approved section patches without full-file rewrite.
- Create `src/mcp/working-thread-docs-store.ts`
  - Validate explicit workspace root.
  - Scope reads and writes to `docs/along/working-threads/`.
  - List summaries, read full records, and apply confirmed section patches.
- Create `src/mcp/working-thread-operations.ts`
  - Implement action-only contract operations: `classifyDrift`, `draftWrapUp`, `proposeWorkingThreadUpdate`, and `applyConfirmedWorkingThreadUpdate`.
  - Keep natural-language judgment with the caller; use deterministic boundary checks and caller-provided fields.
- Create `src/mcp/working-thread-server.ts`
  - Parse `--workspace`.
  - Create the docs store and operation handlers.
  - Register MCP resources and the four approved tools.
  - Connect through `StdioServerTransport`.
- Create `tests/mcp/working-thread-package.test.ts`
  - Assert package script and dependency boundaries.
- Create `tests/mcp/working-thread-markdown.test.ts`
  - Cover parser, summary extraction, malformed reads, section patching, and full-file rewrite rejection.
- Create `tests/mcp/working-thread-docs-store.test.ts`
  - Cover workspace scoping, list/read, write path restrictions, malformed write rejection, and stale conflict behavior.
- Create `tests/mcp/working-thread-operations.test.ts`
  - Cover deterministic action handlers and confirmation-gated writes.
- Create `tests/mcp/working-thread-server.test.ts`
  - Cover workspace arg parsing, registered resource/tool names, and no prompt registration.
- Modify `docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md`
  - Record implementation completion and verification after all tasks pass.

---

### Task 1: Dependency Gate And Package Script

**Files:**
- Create: `tests/mcp/working-thread-package.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Write the package boundary test**

Create `tests/mcp/working-thread-package.test.ts` with:

```ts
import packageJson from "../../package.json";

describe("Working Thread MCP package wiring", () => {
  it("exposes a repo-level stdio launch script without adding a new package bin", () => {
    expect(packageJson.scripts["mcp:working-thread"]).toBe(
      "tsx src/mcp/working-thread-server.ts",
    );

    expect(packageJson.bin).toEqual({
      along: "src/cli/index.ts",
    });
  });

  it("uses the standard MCP TypeScript SDK and SDK-compatible Zod", () => {
    expect(packageJson.dependencies["@modelcontextprotocol/sdk"]).toBeDefined();
    expect(packageJson.dependencies.zod).toMatch(/^\^?(3\.(2[5-9]|[3-9]\d)|[4-9]\.)/);
  });
});
```

- [ ] **Step 2: Run the package test and verify it fails**

Run:

```bash
npm test -- tests/mcp/working-thread-package.test.ts
```

Expected: FAIL because `mcp:working-thread` and `@modelcontextprotocol/sdk` are not present yet.

- [ ] **Step 3: Request dependency approval if the SDK is missing**

Inspect `package.json`.

If `@modelcontextprotocol/sdk` is missing or `zod` is lower than `3.25.0`, stop and ask the user for approval with this exact request:

```text
May I run `npm install @modelcontextprotocol/sdk zod@^3.25.0` in this worktree?

Why: the approved Minimal MCP Server spec requires the standard MCP TypeScript SDK, and the SDK requires a compatible Zod peer dependency.
Scope: project-local dependency update in this worktree.
Writes: package.json, package-lock.json, and node_modules.
Risk: network access to npm registry and dependency tree changes; no source code, commit, push, or merge will happen as part of the install command itself.
```

If the user declines, stop this implementation pass and report that the Minimal Server cannot be implemented to spec without either the SDK dependency or a revised spec.

- [ ] **Step 4: Install the approved dependency**

After approval only, run:

```bash
npm install @modelcontextprotocol/sdk zod@^3.25.0
```

Expected: `package.json` and `package-lock.json` update; `node_modules` updates locally.

- [ ] **Step 5: Add the npm script**

Patch `package.json` so the `scripts` block contains:

```json
"mcp:working-thread": "tsx src/mcp/working-thread-server.ts"
```

Keep the existing `bin` unchanged:

```json
"bin": {
  "along": "src/cli/index.ts"
}
```

Do not add `along-working-thread-mcp`, another package bin, or a global CLI entry.

- [ ] **Step 6: Run the package test and verify it passes**

Run:

```bash
npm test -- tests/mcp/working-thread-package.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json tests/mcp/working-thread-package.test.ts
git commit -m "test: cover working thread mcp package wiring"
```

---

### Task 2: Markdown Parser And Section Patching

**Files:**
- Create: `tests/mcp/working-thread-markdown.test.ts`
- Create: `src/mcp/working-thread-markdown.ts`

- [ ] **Step 1: Write failing parser and patch tests**

Create `tests/mcp/working-thread-markdown.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  applyWorkingThreadSectionPatches,
  parseWorkingThreadMarkdown,
  summarizeWorkingThread,
} from "../../src/mcp/working-thread-markdown";

const validRecord = `# Existing-Agent Self-Initiation Layer

Status: active
Last updated: 2026-06-22

## Why This Matters

Along should help existing agents preserve judgment continuity.

## Current Judgment

The Minimal MCP Server spec is approved and awaiting implementation.

## Boundary

- Do not add background runtime.
- Do not add HTTP/SSE transport.

## Drift Triggers

- The work adds an adapter.
- The work writes outside Working Thread records.

## Next Likely Move

Implement the docs-backed stdio MCP server.

## Last Wrap-Up

The user approved the Minimal MCP Server spec.

## Open Questions

- Which agent client should validate the server first?
`;

describe("Working Thread Markdown parser", () => {
  it("parses a valid Working Thread record into the contract shape", () => {
    const parsed = parseWorkingThreadMarkdown({
      id: "2026-06-18-existing-agent-self-initiation-layer",
      sourcePath: "docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md",
      markdown: validRecord,
    });

    expect(parsed.malformed).toBe(false);
    expect(parsed.warnings).toEqual([]);
    expect(parsed.thread).toMatchObject({
      id: "2026-06-18-existing-agent-self-initiation-layer",
      title: "Existing-Agent Self-Initiation Layer",
      status: "active",
      lastUpdated: "2026-06-22",
      currentJudgment: "The Minimal MCP Server spec is approved and awaiting implementation.",
      nextLikelyMove: "Implement the docs-backed stdio MCP server.",
    });
    expect(parsed.thread?.boundary).toEqual([
      "Do not add background runtime.",
      "Do not add HTTP/SSE transport.",
    ]);
    expect(parsed.thread?.openQuestions).toEqual([
      "Which agent client should validate the server first?",
    ]);
  });

  it("builds an actionable summary from a parsed record", () => {
    const parsed = parseWorkingThreadMarkdown({
      id: "thread-one",
      sourcePath: "docs/along/working-threads/thread-one.md",
      markdown: validRecord,
    });

    const summary = summarizeWorkingThread(parsed);

    expect(summary).toMatchObject({
      id: "thread-one",
      title: "Existing-Agent Self-Initiation Layer",
      status: "active",
      lastUpdated: "2026-06-22",
      riskLevel: "medium",
      needsUserDecision: true,
    });
    expect(summary.currentJudgmentBrief).toContain("Minimal MCP Server");
  });

  it("returns partial records with warnings for malformed Markdown", () => {
    const parsed = parseWorkingThreadMarkdown({
      id: "broken-thread",
      sourcePath: "docs/along/working-threads/broken-thread.md",
      markdown: `# Broken Thread

Status: active

## Current Judgment

This record is missing required sections.
`,
    });

    expect(parsed.malformed).toBe(true);
    expect(parsed.thread).toBeUndefined();
    expect(parsed.partial.title).toBe("Broken Thread");
    expect(parsed.warnings.map((warning) => warning.code)).toContain("missing-section");
  });

  it("applies approved section patches without rewriting unrelated sections", () => {
    const patched = applyWorkingThreadSectionPatches(validRecord, [
      {
        section: "currentJudgment",
        currentValue: "The Minimal MCP Server spec is approved and awaiting implementation.",
        proposedValue: "The Minimal MCP Server implementation has passed verification.",
        rationale: "Implementation completed without crossing V1 boundaries.",
      },
      {
        section: "nextLikelyMove",
        currentValue: "Implement the docs-backed stdio MCP server.",
        proposedValue: "Validate the MCP server from a fresh Codex session.",
        rationale: "The next gate is real-session behavior validation.",
      },
    ]);

    expect(patched).toContain("## Current Judgment\n\nThe Minimal MCP Server implementation has passed verification.\n");
    expect(patched).toContain("## Next Likely Move\n\nValidate the MCP server from a fresh Codex session.\n");
    expect(patched).toContain("## Boundary\n\n- Do not add background runtime.\n- Do not add HTTP/SSE transport.");
    expect(patched).toContain("## Last Wrap-Up\n\nThe user approved the Minimal MCP Server spec.");
  });

  it("rejects section patches when the current value does not match", () => {
    expect(() => applyWorkingThreadSectionPatches(validRecord, [
      {
        section: "currentJudgment",
        currentValue: "A stale value.",
        proposedValue: "A new value.",
        rationale: "This should conflict.",
      },
    ])).toThrow(/current value/i);
  });

  it("rejects section patches for missing sections", () => {
    expect(() => applyWorkingThreadSectionPatches("# Broken\n", [
      {
        section: "lastWrapUp",
        currentValue: "",
        proposedValue: "A wrap-up.",
        rationale: "Missing section cannot be patched safely.",
      },
    ])).toThrow(/section/i);
  });
});
```

- [ ] **Step 2: Run the parser tests and verify they fail**

Run:

```bash
npm test -- tests/mcp/working-thread-markdown.test.ts
```

Expected: FAIL because `src/mcp/working-thread-markdown.ts` does not exist.

- [ ] **Step 3: Implement the parser and patcher**

Create `src/mcp/working-thread-markdown.ts` with these exported functions and types:

```ts
import {
  type RiskLevel,
  type WorkingThread,
  type WorkingThreadSection,
  type WorkingThreadSectionChange,
  type WorkingThreadStatus,
  type WorkingThreadSummary,
  workingThreadSections,
  workingThreadStatuses,
} from "../core/working-thread-contract";

const sectionHeadings: Record<WorkingThreadSection, string> = {
  whyThisMatters: "Why This Matters",
  currentJudgment: "Current Judgment",
  boundary: "Boundary",
  driftTriggers: "Drift Triggers",
  nextLikelyMove: "Next Likely Move",
  lastWrapUp: "Last Wrap-Up",
  openQuestions: "Open Questions",
};

const sectionByHeading = new Map(
  Object.entries(sectionHeadings).map(([section, heading]) => [heading, section as WorkingThreadSection]),
);

const listSections = new Set<WorkingThreadSection>(["boundary", "driftTriggers", "openQuestions"]);

export interface WorkingThreadParseWarning {
  code: "missing-title" | "missing-status" | "invalid-status" | "missing-last-updated" | "missing-section" | "duplicate-section";
  message: string;
  section?: string;
}

export interface ParsedWorkingThreadDocument {
  id: string;
  sourcePath: string;
  rawMarkdown: string;
  malformed: boolean;
  warnings: WorkingThreadParseWarning[];
  thread?: WorkingThread;
  partial: {
    id: string;
    title?: string;
    status?: string;
    lastUpdated?: string;
    sections: Partial<Record<WorkingThreadSection, string>>;
  };
}

export interface ParseWorkingThreadMarkdownInput {
  id: string;
  sourcePath: string;
  markdown: string;
}

export function parseWorkingThreadMarkdown(input: ParseWorkingThreadMarkdownInput): ParsedWorkingThreadDocument {
  const warnings: WorkingThreadParseWarning[] = [];
  const titleMatch = input.markdown.match(/^#\s+(.+)\s*$/m);
  const statusMatch = input.markdown.match(/^Status:\s*(.+)\s*$/m);
  const lastUpdatedMatch = input.markdown.match(/^Last updated:\s*(.+)\s*$/m);
  const sections = extractSections(input.markdown, warnings);

  if (!titleMatch) {
    warnings.push({ code: "missing-title", message: "Working Thread record is missing an H1 title." });
  }
  if (!statusMatch) {
    warnings.push({ code: "missing-status", message: "Working Thread record is missing a Status line." });
  }
  if (!lastUpdatedMatch) {
    warnings.push({ code: "missing-last-updated", message: "Working Thread record is missing a Last updated line." });
  }

  const rawStatus = statusMatch?.[1]?.trim();
  const status = workingThreadStatuses.includes(rawStatus as WorkingThreadStatus)
    ? rawStatus as WorkingThreadStatus
    : undefined;
  if (rawStatus && !status) {
    warnings.push({ code: "invalid-status", message: `Invalid Working Thread status: ${rawStatus}.` });
  }

  for (const section of workingThreadSections) {
    if (sections[section] === undefined) {
      warnings.push({
        code: "missing-section",
        message: `Working Thread record is missing section: ${sectionHeadings[section]}.`,
        section,
      });
    }
  }

  const partial = {
    id: input.id,
    title: titleMatch?.[1]?.trim(),
    status: rawStatus,
    lastUpdated: lastUpdatedMatch?.[1]?.trim(),
    sections,
  };

  if (warnings.length > 0 || !partial.title || !status || !partial.lastUpdated) {
    return {
      id: input.id,
      sourcePath: input.sourcePath,
      rawMarkdown: input.markdown,
      malformed: true,
      warnings,
      partial,
    };
  }

  const thread: WorkingThread = {
    id: input.id,
    title: partial.title,
    status,
    lastUpdated: partial.lastUpdated,
    whyThisMatters: sections.whyThisMatters ?? "",
    currentJudgment: sections.currentJudgment ?? "",
    boundary: parseBulletList(sections.boundary ?? ""),
    driftTriggers: parseBulletList(sections.driftTriggers ?? ""),
    nextLikelyMove: sections.nextLikelyMove ?? "",
    lastWrapUp: sections.lastWrapUp ?? "",
    openQuestions: parseBulletList(sections.openQuestions ?? ""),
  };

  return {
    id: input.id,
    sourcePath: input.sourcePath,
    rawMarkdown: input.markdown,
    malformed: false,
    warnings,
    thread,
    partial,
  };
}

export function summarizeWorkingThread(parsed: ParsedWorkingThreadDocument): WorkingThreadSummary {
  if (parsed.thread) {
    return {
      id: parsed.thread.id,
      title: parsed.thread.title,
      status: parsed.thread.status,
      lastUpdated: parsed.thread.lastUpdated,
      currentJudgmentBrief: brief(parsed.thread.currentJudgment),
      nextLikelyMove: parsed.thread.nextLikelyMove,
      riskLevel: riskFor(parsed.thread.status, parsed.thread.openQuestions.length > 0, false),
      needsUserDecision: parsed.thread.openQuestions.length > 0,
    };
  }

  return {
    id: parsed.id,
    title: parsed.partial.title ?? parsed.id,
    status: "active",
    lastUpdated: parsed.partial.lastUpdated ?? "unknown",
    currentJudgmentBrief: brief(parsed.partial.sections.currentJudgment ?? "Malformed Working Thread record."),
    nextLikelyMove: "Repair the Working Thread record structure before write-back.",
    riskLevel: "high",
    needsUserDecision: true,
  };
}

export function applyWorkingThreadSectionPatches(
  markdown: string,
  changes: WorkingThreadSectionChange[],
): string {
  let next = markdown;
  for (const change of changes) {
    const heading = sectionHeadings[change.section];
    const currentText = formatSectionValue(change.currentValue);
    const proposedText = formatSectionValue(change.proposedValue);
    const bounds = findSectionBounds(next, heading);

    if (!bounds) {
      throw new Error(`Cannot patch missing Working Thread section: ${heading}`);
    }

    const existing = next.slice(bounds.contentStart, bounds.contentEnd).trim();
    if (existing !== currentText.trim()) {
      throw new Error(`Cannot patch ${heading}: current value does not match proposal base.`);
    }

    next = `${next.slice(0, bounds.contentStart)}${proposedText.trim()}\n${next.slice(bounds.contentEnd)}`;
  }

  return next;
}

function extractSections(
  markdown: string,
  warnings: WorkingThreadParseWarning[],
): Partial<Record<WorkingThreadSection, string>> {
  const matches = [...markdown.matchAll(/^##\s+(.+)\s*$/gm)];
  const sections: Partial<Record<WorkingThreadSection, string>> = {};
  const seen = new Set<WorkingThreadSection>();

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const heading = match[1]?.trim();
    const section = heading ? sectionByHeading.get(heading) : undefined;
    if (!section || match.index === undefined) {
      continue;
    }
    if (seen.has(section)) {
      warnings.push({
        code: "duplicate-section",
        message: `Working Thread record has duplicate section: ${heading}.`,
        section,
      });
      continue;
    }
    seen.add(section);
    const start = match.index + match[0].length;
    const nextMatch = matches[index + 1];
    const end = nextMatch?.index ?? markdown.length;
    sections[section] = markdown.slice(start, end).trim();
  }

  return sections;
}

function parseBulletList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

function formatSectionValue(value: string | string[]): string {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${item}`).join("\n");
  }
  return value;
}

function findSectionBounds(markdown: string, heading: string): { contentStart: number; contentEnd: number } | undefined {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m");
  const match = markdown.match(pattern);
  if (!match || match.index === undefined) {
    return undefined;
  }
  const contentStart = match.index + match[0].length;
  const nextHeading = markdown.slice(contentStart).match(/\n##\s+.+\s*$/m);
  const contentEnd = nextHeading?.index === undefined
    ? markdown.length
    : contentStart + nextHeading.index;
  return { contentStart: contentStart + 1, contentEnd };
}

function brief(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function riskFor(status: WorkingThreadStatus, needsUserDecision: boolean, malformed: boolean): RiskLevel {
  if (malformed) {
    return "high";
  }
  if (needsUserDecision || status === "active") {
    return "medium";
  }
  return "low";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

- [ ] **Step 4: Run parser tests**

Run:

```bash
npm test -- tests/mcp/working-thread-markdown.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/mcp/working-thread-markdown.ts tests/mcp/working-thread-markdown.test.ts
git commit -m "feat: parse working thread markdown"
```

---

### Task 3: Docs-Backed Store

**Files:**
- Create: `tests/mcp/working-thread-docs-store.test.ts`
- Create: `src/mcp/working-thread-docs-store.ts`

- [ ] **Step 1: Write failing docs store tests**

Create `tests/mcp/working-thread-docs-store.test.ts` with:

```ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createWorkingThreadDocsStore } from "../../src/mcp/working-thread-docs-store";

const record = `# Store Test Thread

Status: active
Last updated: 2026-06-22

## Why This Matters

The store must keep Working Thread continuity docs-backed.

## Current Judgment

The store test is running.

## Boundary

- Do not write outside Working Thread records.

## Drift Triggers

- The write escapes the allowed directory.

## Next Likely Move

Patch only the approved section.

## Last Wrap-Up

The parser exists.

## Open Questions

- Should this be validated through a fresh client?
`;

async function createWorkspace(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "along-mcp-store-"));
  await fs.mkdir(path.join(root, "docs/along/working-threads"), { recursive: true });
  await fs.writeFile(
    path.join(root, "docs/along/working-threads/store-test-thread.md"),
    record,
    "utf8",
  );
  return root;
}

describe("Working Thread docs store", () => {
  it("requires an explicit workspace root", () => {
    expect(() => createWorkingThreadDocsStore({ workspaceRoot: "" })).toThrow(/workspace/i);
  });

  it("lists summaries and reads full records from docs/along/working-threads", async () => {
    const workspaceRoot = await createWorkspace();
    const store = createWorkingThreadDocsStore({ workspaceRoot });

    await expect(store.listSummaries()).resolves.toEqual([
      expect.objectContaining({
        id: "store-test-thread",
        title: "Store Test Thread",
        status: "active",
        needsUserDecision: true,
      }),
    ]);

    await expect(store.readThread("store-test-thread")).resolves.toMatchObject({
      malformed: false,
      thread: expect.objectContaining({
        id: "store-test-thread",
        currentJudgment: "The store test is running.",
      }),
    });
  });

  it("applies confirmed section patches inside the allowed directory", async () => {
    const workspaceRoot = await createWorkspace();
    const store = createWorkingThreadDocsStore({ workspaceRoot });

    const result = await store.applySectionPatchProposal({
      proposalId: "proposal-store",
      threadId: "store-test-thread",
      baseLastUpdated: "2026-06-22",
      changes: [
        {
          section: "currentJudgment",
          currentValue: "The store test is running.",
          proposedValue: "The store patch was applied.",
          rationale: "The user confirmed this proposal.",
        },
      ],
      confirmationPrompt: "Write this update?",
      riskLevel: "medium",
    });

    expect(result.thread?.currentJudgment).toBe("The store patch was applied.");
    await expect(fs.readFile(
      path.join(workspaceRoot, "docs/along/working-threads/store-test-thread.md"),
      "utf8",
    )).resolves.toContain("The store patch was applied.");
  });

  it("rejects stale proposals", async () => {
    const workspaceRoot = await createWorkspace();
    const store = createWorkingThreadDocsStore({ workspaceRoot });

    await expect(store.applySectionPatchProposal({
      proposalId: "proposal-stale",
      threadId: "store-test-thread",
      baseLastUpdated: "2026-01-01",
      changes: [],
      confirmationPrompt: "Write this update?",
      riskLevel: "medium",
    })).rejects.toThrow(/stale/i);
  });

  it("rejects malformed record writes", async () => {
    const workspaceRoot = await createWorkspace();
    await fs.writeFile(
      path.join(workspaceRoot, "docs/along/working-threads/broken.md"),
      "# Broken\n\nStatus: active\n",
      "utf8",
    );
    const store = createWorkingThreadDocsStore({ workspaceRoot });

    await expect(store.applySectionPatchProposal({
      proposalId: "proposal-broken",
      threadId: "broken",
      baseLastUpdated: "2026-06-22",
      changes: [],
      confirmationPrompt: "Write this update?",
      riskLevel: "high",
    })).rejects.toThrow(/malformed/i);
  });

  it("rejects thread ids that try to escape the Working Thread directory", async () => {
    const workspaceRoot = await createWorkspace();
    const store = createWorkingThreadDocsStore({ workspaceRoot });

    await expect(store.readThread("../package")).rejects.toThrow(/invalid thread id/i);
  });
});
```

- [ ] **Step 2: Run docs store tests and verify they fail**

Run:

```bash
npm test -- tests/mcp/working-thread-docs-store.test.ts
```

Expected: FAIL because `src/mcp/working-thread-docs-store.ts` does not exist.

- [ ] **Step 3: Implement the docs-backed store**

Create `src/mcp/working-thread-docs-store.ts` with:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import {
  type WorkingThreadSummary,
  type WorkingThreadUpdateProposal,
} from "../core/working-thread-contract";
import {
  applyWorkingThreadSectionPatches,
  parseWorkingThreadMarkdown,
  summarizeWorkingThread,
  type ParsedWorkingThreadDocument,
} from "./working-thread-markdown";

export interface WorkingThreadDocsStoreOptions {
  workspaceRoot: string;
}

export interface WorkingThreadDocsStore {
  readonly workspaceRoot: string;
  readonly recordsDir: string;
  listSummaries(): Promise<WorkingThreadSummary[]>;
  readThread(threadId: string): Promise<ParsedWorkingThreadDocument>;
  applySectionPatchProposal(proposal: WorkingThreadUpdateProposal): Promise<ParsedWorkingThreadDocument>;
}

export function createWorkingThreadDocsStore(options: WorkingThreadDocsStoreOptions): WorkingThreadDocsStore {
  const workspaceRoot = path.resolve(options.workspaceRoot || "");
  if (!options.workspaceRoot || workspaceRoot === path.parse(workspaceRoot).root) {
    throw new Error("An explicit workspace root is required.");
  }

  const recordsDir = path.join(workspaceRoot, "docs/along/working-threads");

  return {
    workspaceRoot,
    recordsDir,
    async listSummaries() {
      const files = await listMarkdownFiles(recordsDir);
      const parsed = await Promise.all(files.map((file) => readRecord(recordsDir, file)));
      return parsed.map(summarizeWorkingThread).sort((a, b) => a.id.localeCompare(b.id));
    },
    async readThread(threadId) {
      return readRecord(recordsDir, `${safeThreadId(threadId)}.md`);
    },
    async applySectionPatchProposal(proposal) {
      const parsed = await readRecord(recordsDir, `${safeThreadId(proposal.threadId)}.md`);
      if (parsed.malformed || !parsed.thread) {
        throw new Error(`Cannot write malformed Working Thread record: ${proposal.threadId}`);
      }
      if (parsed.thread.lastUpdated !== proposal.baseLastUpdated) {
        throw new Error(`Stale proposal for ${proposal.threadId}: baseLastUpdated does not match current record.`);
      }

      const filePath = pathForThread(recordsDir, proposal.threadId);
      const patched = applyWorkingThreadSectionPatches(parsed.rawMarkdown, proposal.changes);
      await fs.writeFile(filePath, patched, "utf8");
      return readRecord(recordsDir, `${safeThreadId(proposal.threadId)}.md`);
    },
  };
}

async function listMarkdownFiles(recordsDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(recordsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md")
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function readRecord(recordsDir: string, fileName: string): Promise<ParsedWorkingThreadDocument> {
  const threadId = fileName.replace(/\.md$/, "");
  const filePath = pathForThread(recordsDir, threadId);
  const markdown = await fs.readFile(filePath, "utf8");
  return parseWorkingThreadMarkdown({
    id: threadId,
    sourcePath: path.relative(path.dirname(recordsDir), filePath),
    markdown,
  });
}

function pathForThread(recordsDir: string, threadId: string): string {
  const safeId = safeThreadId(threadId);
  const filePath = path.join(recordsDir, `${safeId}.md`);
  const relative = path.relative(recordsDir, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Thread path escapes Working Thread directory: ${threadId}`);
  }
  return filePath;
}

function safeThreadId(threadId: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(threadId)) {
    throw new Error(`Invalid thread id: ${threadId}`);
  }
  return threadId;
}
```

- [ ] **Step 4: Run parser and store tests**

Run:

```bash
npm test -- tests/mcp/working-thread-markdown.test.ts tests/mcp/working-thread-docs-store.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/mcp/working-thread-docs-store.ts tests/mcp/working-thread-docs-store.test.ts
git commit -m "feat: add working thread docs store"
```

---

### Task 4: Action-Only Operation Handlers

**Files:**
- Create: `tests/mcp/working-thread-operations.test.ts`
- Create: `src/mcp/working-thread-operations.ts`

- [ ] **Step 1: Write failing operation handler tests**

Create `tests/mcp/working-thread-operations.test.ts` with:

```ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createWorkingThreadDocsStore } from "../../src/mcp/working-thread-docs-store";
import { createWorkingThreadOperations } from "../../src/mcp/working-thread-operations";

const record = `# Operation Test Thread

Status: active
Last updated: 2026-06-22

## Why This Matters

Along should preserve confirmed judgment changes.

## Current Judgment

The Minimal Server implementation is in progress.

## Boundary

- Do not add HTTP/SSE transport.
- Do not add background runtime.

## Drift Triggers

- The work adds HTTP transport.
- The work adds Hermes adapter.

## Next Likely Move

Implement operation handlers.

## Last Wrap-Up

The docs store exists.

## Open Questions

- Should this be validated from a fresh client?
`;

async function setup() {
  const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "along-mcp-ops-"));
  await fs.mkdir(path.join(workspaceRoot, "docs/along/working-threads"), { recursive: true });
  await fs.writeFile(
    path.join(workspaceRoot, "docs/along/working-threads/operation-test-thread.md"),
    record,
    "utf8",
  );
  const store = createWorkingThreadDocsStore({ workspaceRoot });
  const parsed = await store.readThread("operation-test-thread");
  if (!parsed.thread) {
    throw new Error("Expected valid test thread.");
  }
  return {
    workspaceRoot,
    store,
    operations: createWorkingThreadOperations(store),
    thread: parsed.thread,
  };
}

describe("Working Thread MCP operations", () => {
  it("classifies ordinary requests as direct answers", async () => {
    const { operations, thread } = await setup();

    await expect(operations.classifyDrift({
      thread,
      userRequest: "帮我看一下 package.json 里有哪些 scripts。",
    })).resolves.toMatchObject({
      status: "ok",
      operation: "classifyDrift",
      data: {
        driftLevel: "none",
        recommendedAction: "answerDirectly",
        needsUserConfirmation: false,
      },
    });
  });

  it("classifies explicit boundary-crossing requests as high drift", async () => {
    const { operations, thread } = await setup();

    await expect(operations.classifyDrift({
      thread,
      userRequest: "我们现在直接加 HTTP transport 和 Hermes adapter。",
      proposedDirection: "Add HTTP transport and Hermes adapter.",
    })).resolves.toMatchObject({
      status: "ok",
      operation: "classifyDrift",
      data: {
        driftLevel: "high",
        recommendedAction: "askConfirmation",
        needsUserConfirmation: true,
      },
    });
  });

  it("turns caller-provided wrap-up fields into structured drafts and proposals", async () => {
    const { operations, thread } = await setup();

    const draft = await operations.draftWrapUp({
      thread,
      sessionSummary: "Operation handlers were implemented.",
      judgmentChange: "The operation handlers are implemented and verified.",
      boundaryChange: "Keep stdio-only and docs-backed behavior.",
      nextLikelyMove: "Wire operation handlers into the MCP server.",
      openQuestionsChange: "Validate through MCP client smoke later.",
    });

    expect(draft).toMatchObject({
      status: "ok",
      operation: "draftWrapUp",
      data: {
        summary: "Operation handlers were implemented.",
        requiresConfirmation: true,
      },
    });

    const proposal = await operations.proposeWorkingThreadUpdate({
      thread,
      draft: draft.data!,
    });

    expect(proposal.status).toBe("needsConfirmation");
    expect(proposal.data?.changes.map((change) => change.section)).toEqual([
      "currentJudgment",
      "boundary",
      "nextLikelyMove",
      "lastWrapUp",
      "openQuestions",
    ]);
  });

  it("rejects write-back without explicit confirmation", async () => {
    const { operations, thread } = await setup();

    const proposal = {
      proposalId: "proposal-missing-confirmation",
      threadId: thread.id,
      baseLastUpdated: thread.lastUpdated,
      changes: [],
      confirmationPrompt: "Write this update?",
      riskLevel: "medium",
    } as const;

    await expect(operations.applyConfirmedWorkingThreadUpdate({
      proposal,
      confirmation: {
        proposalId: proposal.proposalId,
        approved: true,
        approvedAt: "2026-06-22T00:00:00.000Z",
        approvedBy: "user",
        sourceSessionId: "",
        sourceTurnId: "turn-1",
        approvedIntent: "Apply update.",
        baseLastUpdated: proposal.baseLastUpdated,
      },
    })).resolves.toMatchObject({
      status: "rejected",
      operation: "applyConfirmedWorkingThreadUpdate",
    });
  });

  it("applies confirmed section patches and returns the updated thread", async () => {
    const { operations, thread } = await setup();

    const result = await operations.applyConfirmedWorkingThreadUpdate({
      proposal: {
        proposalId: "proposal-confirmed",
        threadId: thread.id,
        baseLastUpdated: thread.lastUpdated,
        changes: [
          {
            section: "currentJudgment",
            currentValue: thread.currentJudgment,
            proposedValue: "The confirmed write-back path works.",
            rationale: "The user approved this proposal.",
          },
        ],
        confirmationPrompt: "Write this update?",
        riskLevel: "medium",
      },
      confirmation: {
        proposalId: "proposal-confirmed",
        approved: true,
        approvedAt: "2026-06-22T00:00:00.000Z",
        approvedBy: "user",
        sourceSessionId: "session-main",
        sourceTurnId: "turn-1",
        approvedIntent: "Apply the confirmed operation test update.",
        baseLastUpdated: thread.lastUpdated,
      },
    });

    expect(result).toMatchObject({
      status: "ok",
      operation: "applyConfirmedWorkingThreadUpdate",
      data: {
        appliedProposalId: "proposal-confirmed",
        thread: {
          currentJudgment: "The confirmed write-back path works.",
        },
      },
    });
  });
});
```

- [ ] **Step 2: Run operation tests and verify they fail**

Run:

```bash
npm test -- tests/mcp/working-thread-operations.test.ts
```

Expected: FAIL because `src/mcp/working-thread-operations.ts` does not exist.

- [ ] **Step 3: Implement operation handlers**

Create `src/mcp/working-thread-operations.ts` with:

```ts
import {
  type ApplyConfirmedWorkingThreadUpdateInput,
  type ApplyConfirmedWorkingThreadUpdateResult,
  type ClassifyDriftInput,
  type ClassifyDriftResult,
  type DraftWrapUpInput,
  type DraftWrapUpResult,
  type ProposeWorkingThreadUpdateInput,
  type ProposeWorkingThreadUpdateResult,
  type WorkingThread,
  type WorkingThreadContractOperations,
  type WorkingThreadSectionChange,
} from "../core/working-thread-contract";
import { type WorkingThreadDocsStore } from "./working-thread-docs-store";

export type WorkingThreadMcpOperations = Pick<
  WorkingThreadContractOperations,
  "classifyDrift" | "draftWrapUp" | "proposeWorkingThreadUpdate" | "applyConfirmedWorkingThreadUpdate"
>;

export function createWorkingThreadOperations(store: WorkingThreadDocsStore): WorkingThreadMcpOperations {
  return {
    async classifyDrift(input) {
      return classifyDrift(input);
    },
    async draftWrapUp(input) {
      return draftWrapUp(input);
    },
    async proposeWorkingThreadUpdate(input) {
      return proposeWorkingThreadUpdate(input);
    },
    async applyConfirmedWorkingThreadUpdate(input) {
      return applyConfirmedWorkingThreadUpdate(store, input);
    },
  };
}

function classifyDrift(input: ClassifyDriftInput): Promise<ClassifyDriftResult> {
  const text = `${input.userRequest} ${input.proposedDirection ?? ""}`.toLowerCase();
  const boundaryText = "boundary" in input.thread
    ? [...input.thread.boundary, ...input.thread.driftTriggers].join(" ").toLowerCase()
    : "";

  const crossesBoundary = [
    "http",
    "sse",
    "daemon",
    "background",
    "hermes",
    "adapter",
    "delegation",
    "memory v2",
    ".along",
  ].some((signal) => text.includes(signal) && boundaryText.includes(signal));

  const proposedDirection = Boolean(input.proposedDirection?.trim());

  const data = crossesBoundary
    ? {
      driftLevel: "high" as const,
      reason: "The request appears to cross a stored Working Thread boundary.",
      recommendedAction: "askConfirmation" as const,
      needsUserConfirmation: true,
    }
    : proposedDirection
      ? {
        driftLevel: "medium" as const,
        reason: "The request explores a related direction without clearly crossing a stored boundary.",
        recommendedAction: "answerWithBoundary" as const,
        needsUserConfirmation: false,
      }
      : {
        driftLevel: "none" as const,
        reason: "The request does not appear to change the Working Thread direction.",
        recommendedAction: "answerDirectly" as const,
        needsUserConfirmation: false,
      };

  return Promise.resolve({
    status: "ok",
    operation: "classifyDrift",
    threadId: input.thread.id,
    data,
  });
}

function draftWrapUp(input: DraftWrapUpInput): Promise<DraftWrapUpResult> {
  return Promise.resolve({
    status: "ok",
    operation: "draftWrapUp",
    threadId: input.thread.id,
    data: {
      summary: input.sessionSummary,
      judgmentChange: input.judgmentChange ?? "",
      boundaryChange: input.boundaryChange ?? "",
      nextLikelyMove: input.nextLikelyMove ?? "",
      openQuestionsChange: input.openQuestionsChange ?? "",
      requiresConfirmation: true,
    },
  });
}

function proposeWorkingThreadUpdate(input: ProposeWorkingThreadUpdateInput): Promise<ProposeWorkingThreadUpdateResult> {
  const changes: WorkingThreadSectionChange[] = [];
  appendStringChange(changes, "currentJudgment", input.thread.currentJudgment, input.draft.judgmentChange, "Record the approved judgment change.");
  appendListChange(changes, "boundary", input.thread.boundary, input.draft.boundaryChange, "Record the approved boundary change.");
  appendStringChange(changes, "nextLikelyMove", input.thread.nextLikelyMove, input.draft.nextLikelyMove, "Record the approved next move.");
  appendStringChange(changes, "lastWrapUp", input.thread.lastWrapUp, input.draft.summary, "Record the approved phase wrap-up.");
  appendListChange(changes, "openQuestions", input.thread.openQuestions, input.draft.openQuestionsChange, "Record the approved open-question change.");

  return Promise.resolve({
    status: "needsConfirmation",
    operation: "proposeWorkingThreadUpdate",
    threadId: input.thread.id,
    message: "Write these Working Thread updates?",
    data: {
      proposalId: `proposal-${input.thread.id}-${input.thread.lastUpdated.replace(/[^a-zA-Z0-9]/g, "")}`,
      threadId: input.thread.id,
      baseLastUpdated: input.thread.lastUpdated,
      changes,
      confirmationPrompt: "Write these Working Thread updates?",
      riskLevel: changes.length > 2 ? "medium" : "low",
    },
  });
}

async function applyConfirmedWorkingThreadUpdate(
  store: WorkingThreadDocsStore,
  input: ApplyConfirmedWorkingThreadUpdateInput,
): Promise<ApplyConfirmedWorkingThreadUpdateResult> {
  const rejection = validateConfirmation(input);
  if (rejection) {
    return rejection;
  }

  try {
    const parsed = await store.applySectionPatchProposal(input.proposal);
    if (!parsed.thread) {
      return {
        status: "error",
        operation: "applyConfirmedWorkingThreadUpdate",
        threadId: input.proposal.threadId,
        reason: "Updated Working Thread record could not be parsed after write.",
      };
    }

    return {
      status: "ok",
      operation: "applyConfirmedWorkingThreadUpdate",
      threadId: input.proposal.threadId,
      data: {
        appliedProposalId: input.proposal.proposalId,
        thread: parsed.thread,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/stale/i.test(message)) {
      const current = await store.readThread(input.proposal.threadId);
      return {
        status: "conflict",
        operation: "applyConfirmedWorkingThreadUpdate",
        threadId: input.proposal.threadId,
        reason: message,
        recommendedAction: "regenerateProposal",
        data: {
          status: "conflict",
          reason: message,
          currentThreadSummary: current.thread
            ? {
              id: current.thread.id,
              title: current.thread.title,
              status: current.thread.status,
              lastUpdated: current.thread.lastUpdated,
              currentJudgmentBrief: current.thread.currentJudgment,
              nextLikelyMove: current.thread.nextLikelyMove,
              riskLevel: "medium",
              needsUserDecision: current.thread.openQuestions.length > 0,
            }
            : {
              id: input.proposal.threadId,
              title: input.proposal.threadId,
              status: "active",
              lastUpdated: "unknown",
              currentJudgmentBrief: "Malformed Working Thread record.",
              nextLikelyMove: "Repair the record before write-back.",
              riskLevel: "high",
              needsUserDecision: true,
            },
          staleProposal: input.proposal,
          recommendedAction: "regenerateProposal",
        },
      };
    }

    return {
      status: "rejected",
      operation: "applyConfirmedWorkingThreadUpdate",
      threadId: input.proposal.threadId,
      reason: message,
    };
  }
}

function validateConfirmation(input: ApplyConfirmedWorkingThreadUpdateInput): ApplyConfirmedWorkingThreadUpdateResult | undefined {
  const { proposal, confirmation } = input;
  if (!confirmation.approved) {
    return rejected(proposal.threadId, "Confirmation envelope is not approved.");
  }
  if (confirmation.proposalId !== proposal.proposalId) {
    return rejected(proposal.threadId, "Confirmation proposalId does not match proposal.");
  }
  if (confirmation.baseLastUpdated !== proposal.baseLastUpdated) {
    return rejected(proposal.threadId, "Confirmation baseLastUpdated does not match proposal.");
  }
  if (!confirmation.sourceSessionId.trim() || !confirmation.sourceTurnId.trim()) {
    return rejected(proposal.threadId, "Confirmation envelope must include source session and turn ids.");
  }
  if (!confirmation.approvedIntent.trim()) {
    return rejected(proposal.threadId, "Confirmation envelope must include approved intent.");
  }
  return undefined;
}

function rejected(threadId: string, reason: string): ApplyConfirmedWorkingThreadUpdateResult {
  return {
    status: "rejected",
    operation: "applyConfirmedWorkingThreadUpdate",
    threadId,
    reason,
  };
}

function appendStringChange(
  changes: WorkingThreadSectionChange[],
  section: WorkingThreadSectionChange["section"],
  currentValue: string,
  proposedValue: string,
  rationale: string,
): void {
  if (proposedValue.trim() && proposedValue.trim() !== currentValue.trim()) {
    changes.push({ section, currentValue, proposedValue: proposedValue.trim(), rationale });
  }
}

function appendListChange(
  changes: WorkingThreadSectionChange[],
  section: WorkingThreadSectionChange["section"],
  currentValue: string[],
  proposedValue: string,
  rationale: string,
): void {
  if (proposedValue.trim()) {
    changes.push({ section, currentValue, proposedValue: [...currentValue, proposedValue.trim()], rationale });
  }
}
```

- [ ] **Step 4: Run operation tests**

Run:

```bash
npm test -- tests/mcp/working-thread-operations.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/mcp/working-thread-operations.ts tests/mcp/working-thread-operations.test.ts
git commit -m "feat: add working thread mcp operations"
```

---

### Task 5: MCP Server Surface And Stdio Entry

**Files:**
- Create: `tests/mcp/working-thread-server.test.ts`
- Create: `src/mcp/working-thread-server.ts`

- [ ] **Step 1: Write failing server-surface tests**

Create `tests/mcp/working-thread-server.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  WORKING_THREAD_RESOURCE_URIS,
  WORKING_THREAD_TOOL_NAMES,
  parseWorkspaceArg,
} from "../../src/mcp/working-thread-server";

describe("Working Thread MCP server surface", () => {
  it("declares only summary and full-record resources", () => {
    expect(WORKING_THREAD_RESOURCE_URIS).toEqual([
      "working-thread://summaries",
      "working-thread://threads/{threadId}/summary",
      "working-thread://threads/{threadId}/record",
    ]);
  });

  it("declares only the four approved action tools", () => {
    expect(WORKING_THREAD_TOOL_NAMES).toEqual([
      "classifyDrift",
      "draftWrapUp",
      "proposeWorkingThreadUpdate",
      "applyConfirmedWorkingThreadUpdate",
    ]);
    expect(WORKING_THREAD_TOOL_NAMES).not.toContain("readWorkingThread");
    expect(WORKING_THREAD_TOOL_NAMES).not.toContain("listWorkingThreads");
    expect(WORKING_THREAD_TOOL_NAMES).not.toContain("deleteWorkingThread");
    expect(WORKING_THREAD_TOOL_NAMES).not.toContain("delegateToAgent");
  });

  it("requires an explicit workspace argument", () => {
    expect(() => parseWorkspaceArg(["node", "server"])).toThrow(/--workspace/i);
    expect(parseWorkspaceArg(["node", "server", "--workspace", "/tmp/along"])).toBe("/tmp/along");
  });
});
```

- [ ] **Step 2: Run server tests and verify they fail**

Run:

```bash
npm test -- tests/mcp/working-thread-server.test.ts
```

Expected: FAIL because `src/mcp/working-thread-server.ts` does not exist.

- [ ] **Step 3: Implement the server entry**

Create `src/mcp/working-thread-server.ts` with:

```ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v4";
import { createWorkingThreadDocsStore, type WorkingThreadDocsStore } from "./working-thread-docs-store";
import { createWorkingThreadOperations } from "./working-thread-operations";

export const WORKING_THREAD_RESOURCE_URIS = [
  "working-thread://summaries",
  "working-thread://threads/{threadId}/summary",
  "working-thread://threads/{threadId}/record",
] as const;

export const WORKING_THREAD_TOOL_NAMES = [
  "classifyDrift",
  "draftWrapUp",
  "proposeWorkingThreadUpdate",
  "applyConfirmedWorkingThreadUpdate",
] as const;

export function parseWorkspaceArg(argv: string[]): string {
  const index = argv.indexOf("--workspace");
  const workspace = index >= 0 ? argv[index + 1] : undefined;
  if (!workspace) {
    throw new Error("Missing required --workspace /path/to/repo argument.");
  }
  return workspace;
}

export function createWorkingThreadMcpServer(store: WorkingThreadDocsStore): McpServer {
  const server = new McpServer({
    name: "along-working-thread",
    version: "0.1.0",
  });
  const operations = createWorkingThreadOperations(store);

  server.registerResource(
    "working-thread-summaries",
    "working-thread://summaries",
    {
      title: "Along Working Thread Summaries",
      description: "Summary view of Along Working Threads.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(await store.listSummaries(), null, 2),
      }],
    }),
  );

  server.registerResource(
    "working-thread-summary",
    new ResourceTemplate("working-thread://threads/{threadId}/summary", { list: undefined }),
    {
      title: "Along Working Thread Summary",
      description: "Single Along Working Thread summary.",
      mimeType: "application/json",
    },
    async (uri, { threadId }) => {
      const parsed = await store.readThread(String(threadId));
      const summaries = await store.listSummaries();
      const summary = summaries.find((item) => item.id === String(threadId));
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({
            summary,
            warnings: parsed.warnings,
            malformed: parsed.malformed,
          }, null, 2),
        }],
      };
    },
  );

  server.registerResource(
    "working-thread-record",
    new ResourceTemplate("working-thread://threads/{threadId}/record", { list: undefined }),
    {
      title: "Along Working Thread Record",
      description: "Full Along Working Thread record.",
      mimeType: "application/json",
    },
    async (uri, { threadId }) => {
      const parsed = await store.readThread(String(threadId));
      return {
        contents: [{
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(parsed, null, 2),
        }],
      };
    },
  );

  server.registerTool(
    "classifyDrift",
    {
      title: "Classify Working Thread Drift",
      description: "Classify whether a request changes the active Working Thread direction.",
      inputSchema: {
        thread: z.any(),
        userRequest: z.string(),
        proposedDirection: z.string().optional(),
      },
    },
    async (input) => asToolResult(await operations.classifyDrift(input)),
  );

  server.registerTool(
    "draftWrapUp",
    {
      title: "Draft Working Thread Wrap-Up",
      description: "Shape caller-provided phase-end context into a structured wrap-up draft.",
      inputSchema: {
        thread: z.any(),
        sessionSummary: z.string(),
        judgmentChange: z.string().optional(),
        boundaryChange: z.string().optional(),
        nextLikelyMove: z.string().optional(),
        openQuestionsChange: z.string().optional(),
      },
    },
    async (input) => asToolResult(await operations.draftWrapUp(input)),
  );

  server.registerTool(
    "proposeWorkingThreadUpdate",
    {
      title: "Propose Working Thread Update",
      description: "Turn a wrap-up draft into a section patch proposal that requires user confirmation.",
      inputSchema: {
        thread: z.any(),
        draft: z.any(),
      },
    },
    async (input) => asToolResult(await operations.proposeWorkingThreadUpdate(input)),
  );

  server.registerTool(
    "applyConfirmedWorkingThreadUpdate",
    {
      title: "Apply Confirmed Working Thread Update",
      description: "Apply an explicitly confirmed section patch proposal to a Working Thread record.",
      inputSchema: {
        proposal: z.any(),
        confirmation: z.any(),
      },
    },
    async (input) => asToolResult(await operations.applyConfirmedWorkingThreadUpdate(input)),
  );

  return server;
}

export async function main(argv = process.argv): Promise<void> {
  const workspaceRoot = parseWorkspaceArg(argv);
  const store = createWorkingThreadDocsStore({ workspaceRoot });
  const server = createWorkingThreadMcpServer(store);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function asToolResult(result: unknown): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: unknown;
  isError?: boolean;
} {
  const status = typeof result === "object" && result !== null && "status" in result
    ? String((result as { status: unknown }).status)
    : "ok";
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    structuredContent: result,
    isError: status === "error" || status === "rejected" || status === "conflict",
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
```

If the installed SDK types differ from the code above, adapt only the SDK registration calls while preserving:

- `WORKING_THREAD_RESOURCE_URIS`;
- `WORKING_THREAD_TOOL_NAMES`;
- stdio transport;
- no prompts;
- no HTTP/SSE;
- same exported `parseWorkspaceArg`;
- same four operation tools.

- [ ] **Step 4: Run server tests**

Run:

```bash
npm test -- tests/mcp/working-thread-server.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run all MCP tests**

Run:

```bash
npm test -- tests/mcp/working-thread-package.test.ts tests/mcp/working-thread-markdown.test.ts tests/mcp/working-thread-docs-store.test.ts tests/mcp/working-thread-operations.test.ts tests/mcp/working-thread-server.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/mcp/working-thread-server.ts tests/mcp/working-thread-server.test.ts
git commit -m "feat: add working thread stdio mcp server"
```

---

### Task 6: Verification, Spec Status, And Working Thread Record

**Files:**
- Modify: `docs/superpowers/specs/2026-06-21-along-core-mcp-minimal-server-design.md`
- Modify: `docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md`

- [ ] **Step 1: Run targeted tests**

Run:

```bash
npm test -- tests/core/working-thread-contract.test.ts tests/mcp/working-thread-package.test.ts tests/mcp/working-thread-markdown.test.ts tests/mcp/working-thread-docs-store.test.ts tests/mcp/working-thread-operations.test.ts tests/mcp/working-thread-server.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Run full tests**

Run:

```bash
npm test
```

Expected: PASS.

If full tests fail only because the sandbox blocks local server binding with Express `listen EPERM`, rerun with escalation and document that reason in the final handoff.

- [ ] **Step 5: Smoke the npm script argument validation**

Run:

```bash
npm run mcp:working-thread
```

Expected: process exits non-zero and stderr contains `Missing required --workspace`.

Run:

```bash
npm run mcp:working-thread -- --workspace "$(pwd)"
```

Expected: process starts as a stdio MCP server and waits for MCP client input. Stop it manually after confirming it starts without immediate argument/configuration error. Do not leave the process running.

- [ ] **Step 6: Update the design spec status**

Patch `docs/superpowers/specs/2026-06-21-along-core-mcp-minimal-server-design.md`:

```md
Status: Approved and implemented
```

- [ ] **Step 7: Update the Working Thread record**

Patch `docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md` with a short wrap-up under `Last Wrap-Up`:

```md
The Core/MCP Minimal Server was implemented as a docs-backed stdio MCP server under `src/mcp/`. It exposes Working Thread summaries and records as resources and action-only tools for drift classification, wrap-up drafting, update proposals, and confirmed section-patch write-back. Verification passed targeted MCP tests, contract tests, typecheck, build, and full tests. This pass did not add HTTP/SSE transport, background runtime, `.along/` state, LLM calls, prompts, adapters, Memory v2, relationship modes, delegation, or full-file rewrites.
```

Also update `Current Judgment` or `Next Likely Move` to say the next gate is fresh-session MCP client validation, not another implementation layer.

- [ ] **Step 8: Run docs/status checks**

Run:

```bash
rg -n "Status: Draft for user review|[T]BD|[F]IXME" docs/superpowers/specs/2026-06-21-along-core-mcp-minimal-server-design.md docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md
git diff --check
```

Expected: `rg` returns no matches; `git diff --check` returns no output.

- [ ] **Step 9: Commit docs and verification status**

Run:

```bash
git add docs/superpowers/specs/2026-06-21-along-core-mcp-minimal-server-design.md docs/along/working-threads/2026-06-18-existing-agent-self-initiation-layer.md
git commit -m "docs: record minimal mcp server implementation"
```

---

## Final Verification

Before reporting completion, run:

```bash
npm test -- tests/core/working-thread-contract.test.ts tests/mcp/working-thread-package.test.ts tests/mcp/working-thread-markdown.test.ts tests/mcp/working-thread-docs-store.test.ts tests/mcp/working-thread-operations.test.ts tests/mcp/working-thread-server.test.ts
npm run typecheck
npm run build
npm test
git status --short
```

Expected:

- targeted contract/MCP tests pass;
- typecheck passes;
- build passes;
- full tests pass, or sandbox-only Express `listen EPERM` is rerun with escalation and then passes;
- final worktree status is clean except expected ignored or untracked local runtime files such as `.superpowers/`;
- no push, merge, worktree deletion, or history rewrite happens unless explicitly requested.

## Plan Self-Review

Spec coverage:

- Real stdio MCP server: Task 5.
- Docs-backed `docs/along/working-threads/` source: Tasks 2 and 3.
- Resources for summaries and full records: Task 5.
- Action-only tools: Tasks 4 and 5.
- No read/list tools: Task 5 tests.
- No prompts: Task 5 tests.
- No HTTP/SSE/daemon: Task 5 plus absence of HTTP transport and final review.
- No LLM/API key: Task 4 deterministic operation handlers and final review.
- Confirmed write-back: Tasks 3 and 4.
- Section patch only: Task 2.
- Malformed read with write rejection: Tasks 2 and 3.
- Explicit workspace root: Tasks 3 and 5.
- `src/mcp/` organization: Tasks 2-5.
- Standard MCP SDK dependency with approval gate: Task 1.
- Repo npm script: Task 1.

Placeholder scan:

- No task contains unfilled marker text.
- The only allowed implementation-time adjustment is adapting SDK registration calls if installed SDK types differ; the resource names, tool names, transport, and boundaries are fixed.

Type consistency:

- `WorkingThread`, `WorkingThreadSummary`, `WorkingThreadUpdateProposal`, `ConfirmationEnvelope`, and operation result types come from `src/core/working-thread-contract.ts`.
- Markdown sections map to existing contract section keys: `whyThisMatters`, `currentJudgment`, `boundary`, `driftTriggers`, `nextLikelyMove`, `lastWrapUp`, and `openQuestions`.
