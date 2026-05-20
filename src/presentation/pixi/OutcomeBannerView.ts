import { Container, Text } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { RectLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";

export class OutcomeBannerView {
  public readonly container = new Container();
  private readonly label = new Text({
    text: "",
    style: {
      fill: "#f8e7b0",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 30,
      fontWeight: "700"
    }
  });

  public constructor() {
    this.container.label = "outcomeBanner";
    this.label.anchor.set(0.5);
    this.container.addChild(this.label);
  }

  public render(layout: RectLayout, outcome: SpinOutcome | null): void {
    if (outcome === null) {
      this.container.visible = false;
      return;
    }

    this.container.visible = true;
    this.label.text = outcome.isWin ? gameText.win : gameText.lose;
    this.label.style.fill = outcome.isWin ? "#f8e7b0" : "#9fb4c7";
    this.label.position.set(
      layout.x + layout.width / 2,
      layout.y + layout.height / 2
    );
  }
}
