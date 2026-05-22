import { Container, Graphics, Text } from "pixi.js";

import type { SlotViewport } from "../layout/SlotLayout";

export class LoadingView {
  public readonly container = new Container();
  private readonly background = new Graphics();
  private readonly title = new Text({
    text: "LOADING",
    style: {
      fill: "#f8e7b0",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 34,
      fontWeight: "700"
    }
  });
  private readonly percent = new Text({
    text: "0%",
    style: {
      fill: "#ffffff",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 18,
      fontWeight: "700"
    }
  });
  private readonly barTrack = new Graphics();
  private readonly barFill = new Graphics();

  public constructor() {
    this.container.label = "loadingView";
    this.title.anchor.set(0.5);
    this.percent.anchor.set(0.5);
    this.container.addChild(
      this.background,
      this.title,
      this.barTrack,
      this.barFill,
      this.percent
    );
  }

  public render(viewport: SlotViewport, progress: number): void {
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    const barWidth = Math.min(420, viewport.width * 0.68);
    const barHeight = 18;
    const barX = (viewport.width - barWidth) / 2;
    const barY = viewport.height / 2 + 32;

    this.background
      .clear()
      .rect(0, 0, viewport.width, viewport.height)
      .fill(0x07131d);

    this.barTrack
      .clear()
      .roundRect(barX, barY, barWidth, barHeight, 9)
      .fill(0x1f3548);

    this.barFill.clear();
    if (normalizedProgress > 0) {
      this.barFill
        .roundRect(barX, barY, barWidth * normalizedProgress, barHeight, 9)
        .fill(0xf3c86a);
    }

    this.title.position.set(viewport.width / 2, viewport.height / 2 - 22);
    this.percent.text = `${Math.round(normalizedProgress * 100)}%`;
    this.percent.position.set(viewport.width / 2, barY + 42);
  }
}
