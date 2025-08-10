import { describe, expect, it } from "vitest";
import { cn } from "./utils.ts";

describe("cn", () => {
  it("joins strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles objects and arrays", () => {
    expect(cn("a", { x: true, y: false }, ["b", { z: true }])).toBe("a x b z");
  });

  it("skips falsy values", () => {
    expect(cn("a", false, null, undefined, 0 && "x")).toBe("a");
  });
});
