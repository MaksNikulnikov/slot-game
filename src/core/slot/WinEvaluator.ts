import type { SlotSymbols } from "./Symbol";

export class WinEvaluator {
  public isWinningLine(symbols: SlotSymbols): boolean {
    return symbols[0] === symbols[1] && symbols[1] === symbols[2];
  }
}
