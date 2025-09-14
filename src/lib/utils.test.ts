import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles objects and arrays", () => {
    expect(cn("a", { x: true, y: false }, ["b", { z: true }])).toBe("a x b z");
  });

  it("skips falsy values", () => {
    const maybe = 0; // keep falsy without constant binary expression
    const val = maybe ? "x" : false;
    expect(cn("a", false, null, undefined, val)).toBe("a");
  });
});
