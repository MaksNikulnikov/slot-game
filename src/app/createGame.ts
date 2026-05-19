import { MockSpinServer } from "../core/server/MockSpinServer";
import { SlotMachine } from "../core/slot/SlotMachine";
import { createSlotLayout } from "../presentation/layout/createSlotLayout";
import { PixiSlotGame } from "../presentation/pixi/PixiSlotGame";
import type { SlotGameSession } from "../presentation/SlotGameSession";

export async function createGame(): Promise<void> {
  const rootElement = document.querySelector<HTMLDivElement>("#app");

  if (rootElement === null) {
    throw new Error("App root was not found");
  }

  const slotMachine = new SlotMachine(new MockSpinServer());
  const session: SlotGameSession = {
    spin: () => slotMachine.spin()
  };
  const game = new PixiSlotGame(rootElement, {
    createLayout: createSlotLayout,
    initialSymbols: ["cherry", "lemon", "seven"],
    session
  });

  await game.initialize();
}
