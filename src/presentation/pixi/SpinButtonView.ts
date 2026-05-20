import { Container, Graphics, Text } from "pixi.js";

import type { RectLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";

export type SpinButtonViewOptions = {
  onTap(): void;
};

export class SpinButtonView {
  public readonly container = new Container();
  private readonly button = new Graphics();
  private readonly label = new Text({
    text: gameText.spin,
    style: {
      fill: "#ffffff",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 32,
      fontWeight: "700"
    }
  });

  public constructor(private readonly options: SpinButtonViewOptions) {
    this.container.label = "spinButton";
    this.label.anchor.set(0.5);
    this.container.addChild(this.button, this.label);
    this.container.on("pointertap", this.options.onTap);
  }

  public render(layout: RectLayout, isEnabled: boolean): void {
    this.button
      .clear()
      .roundRect(0, 0, layout.width, layout.height, 18)
      .fill(isEnabled ? 0xd94f36 : 0x854234);

    this.container.position.set(layout.x, layout.y);
    this.container.eventMode = isEnabled ? "static" : "none";
    this.container.cursor = isEnabled ? "pointer" : "default";

    this.label.text = isEnabled ? gameText.spin : gameText.spinning;
    this.label.style.fontSize = isEnabled ? 32 : 25;
    this.label.position.set(layout.width / 2, layout.height / 2);
  }
}
