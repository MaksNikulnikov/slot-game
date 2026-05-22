import { describe, expect, it } from "vitest";

import { WinEvaluator } from "./WinEvaluator";

describe("WinEvaluator", () => {
  it("returns the server payline cells for three equal symbols", () => {
    const evaluator = new WinEvaluator();

    expect(evaluator.getWinningLines([["seven", "seven", "seven"]])).toEqual([
      {
        cells: [
          { row: 0, column: 0 },
          { row: 0, column: 1 },
          { row: 0, column: 2 }
        ]
      }
    ]);
  });

  it("returns no winning lines for mixed symbols", () => {
    const evaluator = new WinEvaluator();

    expect(evaluator.getWinningLines([["seven", "cherry", "seven"]])).toEqual(
      []
    );
  });
});
