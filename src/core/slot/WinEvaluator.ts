import type { WinningLine } from "./SpinResult";
import type { SlotMatrix } from "./Symbol";

export class WinEvaluator {
  public getWinningLines(matrix: SlotMatrix): readonly WinningLine[] {
    const payline = matrix[0];

    if (payline[0] !== payline[1] || payline[1] !== payline[2]) {
      return [];
    }

    return [
      {
        cells: [
          { row: 0, column: 0 },
          { row: 0, column: 1 },
          { row: 0, column: 2 }
        ]
      }
    ];
  }
}
