import type { SlotMatrix, SlotSymbols } from "./Symbol";

export type SlotCell = {
  row: number;
  column: number;
};

export type WinningLine = {
  cells: readonly [SlotCell, SlotCell, SlotCell];
};

export type SpinResult = {
  matrix: SlotMatrix;
  winningLines: readonly WinningLine[];
  isWin: boolean;
};

export function getVisibleSymbols(matrix: SlotMatrix): SlotSymbols {
  return matrix[0];
}
