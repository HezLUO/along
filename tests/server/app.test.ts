import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/server/app";

describe("server app", () => {
  it("starts a session through the API", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "along-api-"));
    const repo = path.join(root, "repo");
    const home = path.join(root, "home");
    await fs.mkdir(repo);
    await fs.mkdir(home);
    await fs.writeFile(path.join(repo, "README.md"), "# Demo\n");

    const app = createApp({ repoPath: repo, homeDir: home });
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address.");
    const res = await fetch(`http://127.0.0.1:${address.port}/api/session/start`, { method: "POST" });
    const body = await res.json() as { plan: { learningGoal: string } };
    server.close();

    expect(body.plan.learningGoal).toContain("understand");
  });
});
