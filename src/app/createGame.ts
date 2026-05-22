import { MockSpinServer } from "../core/server/MockSpinServer";
import { SlotMachine } from "../core/slot/SlotMachine";
import type { SlotMatrix } from "../core/slot/Symbol";
import { GameAssetLoader } from "../presentation/assets/GameAssetLoader";
import { gameAssets } from "../presentation/assets/gameAssets";
import { AudioController } from "../presentation/audio/AudioController";
import { createSlotLayout } from "../presentation/layout/createSlotLayout";
import { PixiGameRenderer } from "../presentation/pixi/PixiGameRenderer";
import { SlotGameApplication } from "./SlotGameApplication";
import type { SlotGameSession } from "./SlotGameSession";

export async function createGame(): Promise<void> {
  const rootElement = document.querySelector<HTMLDivElement>("#app");

  if (rootElement === null) {
    throw new Error("App root was not found");
  }

  const slotMachine = new SlotMachine(new MockSpinServer());
  const session: SlotGameSession = {
    spin: () => slotMachine.spin()
  };
  const initialMatrix: SlotMatrix = [["cherry", "lemon", "seven"]];
  const renderer = new PixiGameRenderer(rootElement, {
    assetLoader: new GameAssetLoader({
      assets: gameAssets,
      baseUrl: ""
    }),
    createLayout: createSlotLayout
  });
  const game = new SlotGameApplication({
    audio: new AudioController({
      assets: gameAssets.audio,
      baseUrl: ""
    }),
    initialMatrix,
    renderer,
    session
  });

  await game.start();
}
