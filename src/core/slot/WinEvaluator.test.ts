import { describe, expect, it } from "vitest";

import { WinEvaluator } from "./WinEvaluator";

describe("WinEvaluator", () => {
  it("marks three equal symbols as a win", () => {
    const evaluator = new WinEvaluator();

    expect(evaluator.isWinningLine(["seven", "seven", "seven"])).toBe(true);
  });

  it("marks mixed symbols as a loss", () => {
    const evaluator = new WinEvaluator();

    expect(evaluator.isWinningLine(["seven", "cherry", "seven"])).toBe(false);
  });
});
