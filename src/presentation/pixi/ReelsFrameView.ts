import { Container, Graphics } from "pixi.js";

import type { SlotLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";

export class ReelsFrameView {
  public readonly container = new Container();

  public constructor() {
    this.container.label = "reelsFrame";
  }

  public render(layout: SlotLayout["reels"]): void {
    const frame = layout.frame;

    clearContainer(this.container);
    this.container.addChild(
      new Graphics()
        .roundRect(frame.x, frame.y, frame.width, frame.height, 30)
        .fill(0x22384f)
        .stroke({
          color: 0xf3c86a,
          width: 8
        })
    );
  }
}
