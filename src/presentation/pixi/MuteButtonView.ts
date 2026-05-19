import { Container, Graphics, Text } from "pixi.js";

import type { RectLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { clearContainer } from "./pixiContainerUtils";

export type MuteButtonViewOptions = {
  onTap(): void;
};

export class MuteButtonView {
  public readonly container = new Container();

  public constructor(private readonly options: MuteButtonViewOptions) {
    this.container.label = "muteButton";
  }

  public render(layout: RectLayout, isMuted: boolean): void {
    const button = new Graphics()
      .roundRect(0, 0, layout.width, layout.height, 18)
      .fill(isMuted ? 0x5b6470 : 0x315a73)
      .stroke({
        color: isMuted ? 0x98a1aa : 0x78c4df,
        width: 4
      });
    const label = new Text({
      text: isMuted ? gameText.soundOff : gameText.soundOn,
      style: {
        fill: "#ffffff",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 20,
        fontWeight: "700"
      }
    });

    clearContainer(this.container);
    this.container.position.set(layout.x, layout.y);
    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.container.removeAllListeners("pointertap");
    this.container.on("pointertap", this.options.onTap);

    label.anchor.set(0.5);
    label.position.set(layout.width / 2, layout.height / 2);
    this.container.addChild(button, label);
  }
}
