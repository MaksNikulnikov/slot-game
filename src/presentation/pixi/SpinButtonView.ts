import { Container, Graphics, Text } from "pixi.js";

import type { RectLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { clearContainer } from "./pixiContainerUtils";

export type SpinButtonViewOptions = {
  onTap(): void;
};

export class SpinButtonView {
  public readonly container = new Container();

  public constructor(private readonly options: SpinButtonViewOptions) {
    this.container.label = "spinButton";
  }

  public render(layout: RectLayout, isEnabled: boolean): void {
    const button = new Graphics()
      .roundRect(0, 0, layout.width, layout.height, 18)
      .fill(isEnabled ? 0xd94f36 : 0x854234);
    const label = new Text({
      text: isEnabled ? gameText.spin : gameText.spinning,
      style: {
        fill: "#ffffff",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: isEnabled ? 32 : 25,
        fontWeight: "700"
      }
    });

    clearContainer(this.container);
    this.container.position.set(layout.x, layout.y);
    this.container.eventMode = isEnabled ? "static" : "none";
    this.container.cursor = isEnabled ? "pointer" : "default";
    this.container.removeAllListeners("pointertap");
    this.container.on("pointertap", this.options.onTap);

    label.anchor.set(0.5);
    label.position.set(layout.width / 2, layout.height / 2);
    this.container.addChild(button, label);
  }
}
