import { Container, Graphics, Text } from "pixi.js";

import type { RectLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";

export type MuteButtonViewOptions = {
  onTap(): void;
};

export class MuteButtonView {
  public readonly container = new Container();
  private readonly button = new Graphics();
  private readonly label = new Text({
    text: gameText.soundOn,
    style: {
      fill: "#ffffff",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 20,
      fontWeight: "700"
    }
  });

  public constructor(private readonly options: MuteButtonViewOptions) {
    this.container.label = "muteButton";
    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.label.anchor.set(0.5);
    this.container.addChild(this.button, this.label);
    this.container.on("pointertap", this.options.onTap);
  }

  public render(layout: RectLayout, isMuted: boolean): void {
    this.button
      .clear()
      .roundRect(0, 0, layout.width, layout.height, 18)
      .fill(isMuted ? 0x5b6470 : 0x315a73)
      .stroke({
        color: isMuted ? 0x98a1aa : 0x78c4df,
        width: 4
      });

    this.container.position.set(layout.x, layout.y);

    this.label.text = isMuted ? gameText.soundOff : gameText.soundOn;
    this.label.position.set(layout.width / 2, layout.height / 2);
  }
}
