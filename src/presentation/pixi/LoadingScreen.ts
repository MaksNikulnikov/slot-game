import { Container, Graphics, Text } from "pixi.js";

import type { SlotViewport } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";

export class LoadingScreen {
  public readonly container = new Container();

  public constructor() {
    this.container.label = "loadingScreen";
  }

  public render(viewport: SlotViewport, progress: number): void {
    const barWidth = Math.min(420, viewport.width * 0.68);
    const barHeight = 18;
    const barX = (viewport.width - barWidth) / 2;
    const barY = viewport.height / 2 + 32;
    const background = new Graphics()
      .rect(0, 0, viewport.width, viewport.height)
      .fill(0x07131d);
    const title = new Text({
      text: "LOADING",
      style: {
        fill: "#f8e7b0",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 34,
        fontWeight: "700"
      }
    });
    const percent = new Text({
      text: `${Math.round(progress * 100)}%`,
      style: {
        fill: "#ffffff",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 18,
        fontWeight: "700"
      }
    });
    const barTrack = new Graphics()
      .roundRect(barX, barY, barWidth, barHeight, 9)
      .fill(0x1f3548);
    const barFill = new Graphics()
      .roundRect(barX, barY, barWidth * progress, barHeight, 9)
      .fill(0xf3c86a);

    title.anchor.set(0.5);
    title.position.set(viewport.width / 2, viewport.height / 2 - 22);
    percent.anchor.set(0.5);
    percent.position.set(viewport.width / 2, barY + 42);

    clearContainer(this.container);
    this.container.addChild(background, title, barTrack, barFill, percent);
  }

  public destroy(): void {
    clearContainer(this.container);
    this.container.destroy();
  }
}
