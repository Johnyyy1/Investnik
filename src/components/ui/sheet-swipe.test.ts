import { describe, expect, it } from "vitest";
import { resist, shouldDismiss, springStep } from "./sheet-swipe";

describe("sheet swipe release", () => {
  it("dismisses on distance or on a flick, not on a slow short drag", () => {
    expect(shouldDismiss(50, 100, 400)).toBe(false);
    expect(shouldDismiss(170, 0, 400)).toBe(true);
    expect(shouldDismiss(40, 900, 400)).toBe(true);
  });

  it("keeps the sheet when the finger flicks back past the threshold", () => {
    expect(shouldDismiss(300, -600, 400)).toBe(false);
  });

  it("rubber-bands only against the edge", () => {
    expect(resist(80)).toBe(80);
    expect(resist(-100)).toBe(-20);
  });

  it("settles the spring on its target, carrying the release velocity", () => {
    let [x, v] = [10, 1500] as readonly [number, number];
    const [firstX] = springStep(x, v, 0, 1 / 60, 600, 40);
    expect(firstX).toBeGreaterThan(x); // still moving the way the finger threw it
    for (let frame = 0; frame < 120; frame++) [x, v] = springStep(x, v, 0, 1 / 60, 600, 40);
    expect(Math.abs(x)).toBeLessThan(0.5);
    expect(Math.abs(v)).toBeLessThan(5);
  });
});
