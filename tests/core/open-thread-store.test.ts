import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OpenThreadStore } from "../../src/core/open-thread-store";

async function makeRepo() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "along-threads-"));
  const repo = path.join(root, "repo");
  await fs.mkdir(repo);
  return repo;
}

describe("OpenThreadStore", () => {
  it("initializes with no active threads", async () => {
    const repo = await makeRepo();
    const store = new OpenThreadStore(repo);

    expect(await store.readAll()).toEqual([]);
  });

  it("upserts and sorts threads by update time", async () => {
    const repo = await makeRepo();
    const store = new OpenThreadStore(repo);
    await store.upsert({
      id: "thread-1",
      title: "Runtime plan drift",
      status: "open",
      whyItMatters: "Implementation order affects Along's foundation.",
      currentJudgment: "Runtime Doctor should be finished before Memory v2.",
      evidence: [],
      risks: [],
      nextAttentionTrigger: "Runtime implementation progress changes.",
      interventionThreshold: "Approved plan and implementation diverge.",
      delegationHistory: [],
      memoryLinks: [],
      traceRefs: [],
      createdAt: "2026-06-12T00:00:00.000Z",
      updatedAt: "2026-06-12T00:00:00.000Z",
    });

    await store.appendEvidence("thread-1", {
      id: "evidence-1",
      at: "2026-06-12T00:05:00.000Z",
      kind: "implementation_signal",
      sourceRef: "docs:runtime-progress",
      summary: "Doctor API is still missing.",
      strength: "strong",
    });

    const [thread] = await store.readActive();
    expect(thread.title).toBe("Runtime plan drift");
    expect(thread.evidence).toHaveLength(1);
    expect(thread.updatedAt).toBe("2026-06-12T00:05:00.000Z");
  });

  it("records delegation references without duplicating them", async () => {
    const repo = await makeRepo();
    const store = new OpenThreadStore(repo);
    await store.createSeedThread({
      id: "thread-1",
      title: "Agent identity",
      whyItMatters: "Along should stay focused on self-initiation and companionship.",
      currentJudgment: "Along is a conductor companion, not a default executor.",
    });

    await store.recordDelegation("thread-1", {
      delegationId: "delegation-1",
      target: "codex",
      status: "requested",
      createdAt: "2026-06-12T00:00:00.000Z",
    });
    await store.recordDelegation("thread-1", {
      delegationId: "delegation-1",
      target: "codex",
      status: "requested",
      createdAt: "2026-06-12T00:00:00.000Z",
    });

    const [thread] = await store.readAll();
    expect(thread.delegationHistory).toHaveLength(1);
  });
});
