import { Container, Graphics } from "pixi.js";

import type { RectLayout, SlotLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";

const gradientSteps = 28;

export class ReelsShadowView {
  public readonly container = new Container();

  public constructor() {
    this.container.label = "reelsShadow";
  }

  public render(layout: SlotLayout["reels"]): void {
    const shadow = new Graphics();

    clearContainer(this.container);
    layout.cells.forEach((cell) => {
      shadow
        .roundRect(cell.x, cell.y, cell.width, cell.height, 24)
        .stroke({
          color: 0x000000,
          alpha: 0.22,
          width: 10
        });
      this.addTopShadow(shadow, cell);
      this.addBottomShadow(shadow, cell);
    });
    this.container.addChild(shadow);
  }

  private addTopShadow(graphics: Graphics, cell: RectLayout): void {
    const height = cell.height * 0.42;
    const stepHeight = height / gradientSteps;

    for (let index = 0; index < gradientSteps; index += 1) {
      const progress = index / (gradientSteps - 1);
      const alpha = (1 - progress) ** 1.35 * 0.58;

      graphics
        .rect(
          cell.x + 1,
          cell.y + index * stepHeight,
          cell.width - 2,
          stepHeight + 1
        )
        .fill({
          color: 0x000000,
          alpha
        });
    }
  }

  private addBottomShadow(graphics: Graphics, cell: RectLayout): void {
    const height = cell.height * 0.42;
    const startY = cell.y + cell.height - height;
    const stepHeight = height / gradientSteps;

    for (let index = 0; index < gradientSteps; index += 1) {
      const progress = index / (gradientSteps - 1);
      const alpha = progress ** 1.35 * 0.58;

      graphics
        .rect(
          cell.x + 1,
          startY + index * stepHeight,
          cell.width - 2,
          stepHeight + 1
        )
        .fill({
          color: 0x000000,
          alpha
        });
    }
  }
}
