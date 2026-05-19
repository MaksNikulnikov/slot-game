import { PixiSlotGame } from "../presentation/pixi/PixiSlotGame";

export async function createGame(): Promise<void> {
  const rootElement = document.querySelector<HTMLDivElement>("#app");

  if (rootElement === null) {
    throw new Error("App root was not found");
  }

  const game = new PixiSlotGame(rootElement);

  await game.initialize();
}
