import { Container, Graphics } from "pixi.js";

import type { RectLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";

export class CharacterPlaceholderView {
  public readonly container = new Container();

  public constructor() {
    this.container.label = "characterPlaceholder";
  }

  public render(layout: RectLayout): void {
    clearContainer(this.container);
    this.container.addChild(
      new Graphics()
        .roundRect(layout.x, layout.y, layout.width, layout.height, 24)
        .fill(0x4f6b45)
        .stroke({
          color: 0x9ccc79,
          width: 5
        })
    );
  }
}
