import type { SpinOutcome } from "../core/slot/SpinOutcome";

export type SlotGameSession = {
  spin(): Promise<SpinOutcome>;
};
