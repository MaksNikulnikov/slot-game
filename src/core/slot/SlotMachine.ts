import type { SpinServer } from "../server/SpinServer";
import type { SpinOutcome } from "./SpinOutcome";
import { WinEvaluator } from "./WinEvaluator";

export class SlotMachine {
  public constructor(
    private readonly spinServer: SpinServer,
    private readonly winEvaluator = new WinEvaluator()
  ) {}

  public async spin(): Promise<SpinOutcome> {
    const response = await this.spinServer.spin();

    return {
      symbols: response.symbols,
      isWin: this.winEvaluator.isWinningLine(response.symbols)
    };
  }
}
