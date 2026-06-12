import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ConductorRuntime } from "../../src/core/conductor-runtime";
import { OpenThreadStore } from "../../src/core/open-thread-store";

async function makeRepo() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "along-conductor-"));
  const repo = path.join(root, "repo");
  await fs.mkdir(repo);
  return repo;
}

describe("ConductorRuntime", () => {
  it("runs heartbeat and prepares read-only delegation for a stale thread", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Along should not proceed to Memory v2 before runtime foundations are done.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });

    const conductor = new ConductorRuntime({ repoPath: repo });
    const result = await conductor.runHeartbeat({
      trigger: "resume",
      sessionId: "session-1",
      now: new Date("2026-06-20T00:00:00.000Z"),
    });

    expect(result.attention[0].action).toBe("read_only_delegation");
    expect(result.delegations[0]).toMatchObject({ threadId: "thread-1", target: "codex", status: "requested" });
  });

  it("ingests a delegation result and updates the thread judgment", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });
    const request = await conductor.createReadOnlyDelegation({
      threadId: "thread-1",
      sessionId: "session-1",
      reason: "Need review.",
      question: "Check runtime progress.",
      scope: ["src/core"],
    });

    const merge = await conductor.ingestDelegationResult({
      requestId: request.id,
      threadId: "thread-1",
      target: "codex",
      status: "completed",
      summary: "Doctor API is missing.",
      evidence: ["No doctor endpoint."],
      risks: ["Runtime plan incomplete."],
      recommendations: ["Finish Doctor."],
      confidence: "high",
      completedAt: "2026-06-12T00:05:00.000Z",
    });

    const [thread] = await threads.readAll();
    expect(merge.shouldNotifyUser).toBe(true);
    expect(thread.currentJudgment).toContain("Doctor API is missing");
  });

  it("rejects delegation results with no matching request before mutating the thread", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });

    await expect(conductor.ingestDelegationResult({
      requestId: "missing-request",
      threadId: "thread-1",
      target: "codex",
      status: "completed",
      summary: "Doctor API is missing.",
      evidence: ["No doctor endpoint."],
      risks: ["Runtime plan incomplete."],
      recommendations: ["Finish Doctor."],
      confidence: "high",
      completedAt: "2026-06-12T00:05:00.000Z",
    })).rejects.toThrow("Delegation request not found");

    const [thread] = await threads.readAll();
    expect(thread.currentJudgment).toBe("Runtime implementation may be incomplete.");
    expect(thread.evidence).toEqual([]);
    expect(thread.delegationHistory).toEqual([]);
  });

  it("rejects delegation results whose request belongs to a different thread", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    await threads.createSeedThread({
      id: "thread-2",
      title: "Memory plan drift",
      whyItMatters: "Memory work should wait for runtime foundations.",
      currentJudgment: "Memory implementation should not start yet.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });
    const request = await conductor.createReadOnlyDelegation({
      threadId: "thread-2",
      sessionId: "session-1",
      reason: "Need review.",
      question: "Check memory progress.",
      scope: ["src/core"],
    });

    await expect(conductor.ingestDelegationResult({
      requestId: request.id,
      threadId: "thread-1",
      target: "codex",
      status: "completed",
      summary: "Doctor API is missing.",
      evidence: ["No doctor endpoint."],
      risks: ["Runtime plan incomplete."],
      recommendations: ["Finish Doctor."],
      confidence: "high",
      completedAt: "2026-06-12T00:05:00.000Z",
    })).rejects.toThrow("Delegation result thread mismatch");

    const thread = (await threads.readAll()).find((item) => item.id === "thread-1");
    expect(thread?.currentJudgment).toBe("Runtime implementation may be incomplete.");
    expect(thread?.evidence).toEqual([]);
    expect(thread?.delegationHistory).toEqual([]);
  });

  it("rejects delegation results whose target does not match the request", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });
    const request = await conductor.createReadOnlyDelegation({
      threadId: "thread-1",
      sessionId: "session-1",
      reason: "Need review.",
      question: "Check runtime progress.",
      scope: ["src/core"],
    });

    await expect(conductor.ingestDelegationResult({
      requestId: request.id,
      threadId: "thread-1",
      target: "manual",
      status: "completed",
      summary: "Doctor API is missing.",
      evidence: ["No doctor endpoint."],
      risks: ["Runtime plan incomplete."],
      recommendations: ["Finish Doctor."],
      confidence: "high",
      completedAt: "2026-06-12T00:05:00.000Z",
    })).rejects.toThrow("Delegation result target mismatch");

    const [thread] = await threads.readAll();
    expect(thread.currentJudgment).toBe("Runtime implementation may be incomplete.");
    expect(thread.evidence).toEqual([]);
  });

  it.each(["failed", "cancelled"] as const)("records %s delegation results without merging judgment", async (status) => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });
    const request = await conductor.createReadOnlyDelegation({
      threadId: "thread-1",
      sessionId: "session-1",
      reason: "Need review.",
      question: "Check runtime progress.",
      scope: ["src/core"],
    });

    const result = await conductor.ingestDelegationResult({
      requestId: request.id,
      threadId: "thread-1",
      target: "codex",
      status,
      summary: "Delegate could not complete.",
      evidence: ["Should not be merged."],
      risks: ["Should not be merged."],
      recommendations: ["Retry later."],
      confidence: "low",
      completedAt: "2026-06-12T00:05:00.000Z",
    });

    const [thread] = await threads.readAll();
    const [storedRequest] = await conductor.readDelegationRequests();
    expect(result).toMatchObject({
      threadId: "thread-1",
      classification: "irrelevant_or_low_signal",
      previousJudgment: "Runtime implementation may be incomplete.",
      nextJudgment: "Runtime implementation may be incomplete.",
      evidenceAdded: [],
    });
    expect(thread.currentJudgment).toBe("Runtime implementation may be incomplete.");
    expect(thread.evidence).toEqual([]);
    expect(thread.delegationHistory[0]).toMatchObject({
      delegationId: request.id,
      status,
      resultRef: `delegation:${request.id}:result`,
    });
    expect(storedRequest.status).toBe(status);
  });

  it("rejects delegation results for requests that already reached a terminal status", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });
    const request = await conductor.createReadOnlyDelegation({
      threadId: "thread-1",
      sessionId: "session-1",
      reason: "Need review.",
      question: "Check runtime progress.",
      scope: ["src/core"],
    });
    const result = {
      requestId: request.id,
      threadId: "thread-1",
      target: "codex" as const,
      status: "completed" as const,
      summary: "Doctor API is missing.",
      evidence: ["No doctor endpoint."],
      risks: ["Runtime plan incomplete."],
      recommendations: ["Finish Doctor."],
      confidence: "high" as const,
      completedAt: "2026-06-12T00:05:00.000Z",
    };

    await conductor.ingestDelegationResult(result);
    await expect(conductor.ingestDelegationResult(result)).rejects.toThrow("already terminal");

    const [thread] = await threads.readAll();
    expect(thread.evidence).toHaveLength(1);
    expect(thread.delegationHistory).toHaveLength(1);
  });

  it("reuses an existing pending delegation instead of appending duplicates", async () => {
    const repo = await makeRepo();
    const threads = new OpenThreadStore(repo);
    await threads.createSeedThread({
      id: "thread-1",
      title: "Runtime plan drift",
      whyItMatters: "Runtime plan drift blocks conductor work.",
      currentJudgment: "Runtime implementation may be incomplete.",
    });
    const conductor = new ConductorRuntime({ repoPath: repo });

    const [first, second] = await Promise.all([
      conductor.createReadOnlyDelegation({
        threadId: "thread-1",
        sessionId: "session-1",
        reason: "Need review.",
        question: "Check runtime progress.",
        scope: ["src/core"],
      }),
      conductor.createReadOnlyDelegation({
        threadId: "thread-1",
        sessionId: "session-1",
        reason: "Need review again.",
        question: "Check runtime progress again.",
        scope: ["src/core"],
      }),
    ]);

    const requests = await conductor.readDelegationRequests();
    const [thread] = await threads.readAll();
    expect(second.id).toBe(first.id);
    expect(requests).toHaveLength(1);
    expect(thread.delegationHistory).toHaveLength(1);
  });
});
