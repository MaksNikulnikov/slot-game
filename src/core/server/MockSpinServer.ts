import type { RandomNumberGenerator } from "../random/RandomNumberGenerator";
import type { SpinResult } from "../slot/SpinResult";
import { slotSymbols } from "../slot/Symbol";
import type { SlotMatrix, SlotSymbol, SlotSymbols } from "../slot/Symbol";
import { WinEvaluator } from "../slot/WinEvaluator";
import type { SpinResponse, SpinServer } from "./SpinServer";

const defaultLatencyMs = 350;

export class MockSpinServer implements SpinServer {
  public constructor(
    private readonly random: RandomNumberGenerator = Math.random,
    private readonly latencyMs = defaultLatencyMs,
    private readonly winEvaluator = new WinEvaluator()
  ) {}

  public async spin(): Promise<SpinResponse> {
    await this.waitForResponse();

    return this.createSpinResult([
      this.pickSymbol(),
      this.pickSymbol(),
      this.pickSymbol()
    ]);
  }

  private createSpinResult(symbols: SlotSymbols): SpinResult {
    const matrix: SlotMatrix = [symbols];
    const winningLines = this.winEvaluator.getWinningLines(matrix);

    return {
      matrix,
      winningLines,
      isWin: winningLines.length > 0
    };
  }

  private pickSymbol(): SlotSymbol {
    const index = Math.floor(this.random() * slotSymbols.length);

    return slotSymbols[index] as SlotSymbol;
  }

  private waitForResponse(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, this.latencyMs);
    });
  }
}
