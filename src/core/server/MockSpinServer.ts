import type { RandomNumberGenerator } from "../random/RandomNumberGenerator";
import { slotSymbols } from "../slot/Symbol";
import type { SlotSymbol } from "../slot/Symbol";
import type { SpinResponse, SpinServer } from "./SpinServer";

const defaultLatencyMs = 350;

export class MockSpinServer implements SpinServer {
  public constructor(
    private readonly random: RandomNumberGenerator = Math.random,
    private readonly latencyMs = defaultLatencyMs
  ) {}

  public async spin(): Promise<SpinResponse> {
    await this.waitForResponse();

    return {
      symbols: [this.pickSymbol(), this.pickSymbol(), this.pickSymbol()]
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
