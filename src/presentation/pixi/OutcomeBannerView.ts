import { Container, Text } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { RectLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { clearContainer } from "./pixiContainerUtils";

export class OutcomeBannerView {
  public readonly container = new Container();

  public constructor() {
    this.container.label = "outcomeBanner";
  }

  public render(layout: RectLayout, outcome: SpinOutcome | null): void {
    clearContainer(this.container);

    if (outcome === null) {
      return;
    }

    const label = new Text({
      text: outcome.isWin ? gameText.win : gameText.lose,
      style: {
        fill: outcome.isWin ? "#f8e7b0" : "#9fb4c7",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 30,
        fontWeight: "700"
      }
    });

    label.anchor.set(0.5);
    label.position.set(layout.x + layout.width / 2, layout.y + layout.height / 2);
    this.container.addChild(label);
  }
}
