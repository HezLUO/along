import { describe, expect, it } from "vitest";
import { presenceStates } from "../../src/core/types";

describe("presence states", () => {
  it("keeps the approved Along workday order", () => {
    expect(presenceStates).toEqual([
      "arriving",
      "settling",
      "quiet_focus",
      "gentle_share",
      "rest",
      "wrap_up",
    ]);
  });
});
