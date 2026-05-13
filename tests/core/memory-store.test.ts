import { describe, expect, it } from "vitest";
import { getGlobalAlongDir, getProjectAlongDir } from "../../src/core/paths";

describe("Along memory paths", () => {
  it("uses .along inside the project", () => {
    expect(getProjectAlongDir("/tmp/demo")).toBe("/tmp/demo/.along");
  });

  it("uses the supplied home directory for global memory", () => {
    expect(getGlobalAlongDir("/Users/example")).toBe("/Users/example/.along");
  });
});
