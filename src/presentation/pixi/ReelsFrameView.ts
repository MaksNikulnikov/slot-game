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
    const paylineY = layout.cells[0].y + layout.cells[0].height / 2;

    clearContainer(this.container);
    this.container.addChild(
      new Graphics()
        .roundRect(frame.x - 18, frame.y - 18, frame.width + 36, frame.height + 36, 42)
        .fill({
          color: 0x050b13,
          alpha: 0.58
        }),
      new Graphics()
        .roundRect(frame.x - 6, frame.y - 6, frame.width + 12, frame.height + 12, 42)
        .fill(0x8a4c12),
      new Graphics()
        .roundRect(frame.x, frame.y, frame.width, frame.height, 38)
        .fill(0x2a1708)
        .stroke({
          color: 0xffd36a,
          width: 12
        }),
      new Graphics()
        .roundRect(frame.x + 12, frame.y + 12, frame.width - 24, frame.height - 24, 30)
        .stroke({
          color: 0xffffff,
          alpha: 0.16,
          width: 3
        }),
      new Graphics()
        .moveTo(frame.x + 24, paylineY)
        .lineTo(frame.x + frame.width - 24, paylineY)
        .stroke({
          color: 0xf8e7b0,
          alpha: 0.34,
          width: 4
        }),
      ...layout.cells.slice(0, 2).map((cell) =>
        new Graphics()
          .roundRect(cell.x + cell.width + 8, frame.y + 28, 6, frame.height - 56, 3)
          .fill({
            color: 0xf3c86a,
            alpha: 0.3
          })
      ),
      ...[
        { x: frame.x + 28, y: frame.y + 28 },
        { x: frame.x + frame.width - 28, y: frame.y + 28 },
        { x: frame.x + 28, y: frame.y + frame.height - 28 },
        { x: frame.x + frame.width - 28, y: frame.y + frame.height - 28 }
      ].map((rivet) =>
        new Graphics()
          .circle(rivet.x, rivet.y, 7)
          .fill(0xf8e7b0)
          .stroke({
            color: 0x8b6320,
            width: 2
          })
      )
    );
  }
}
