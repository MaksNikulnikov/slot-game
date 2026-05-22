import type { SpinResult } from "../core/slot/SpinResult";

export type SlotGameSession = {
  spin(): Promise<SpinResult>;
};
