import type { SpinServer } from "../server/SpinServer";
import type { SpinResult } from "./SpinResult";

export class SlotMachine {
  public constructor(private readonly spinServer: SpinServer) {}

  public spin(): Promise<SpinResult> {
    return this.spinServer.spin();
  }
}
