import { Container, Sprite } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";

export class ReelsFrameView {
  public readonly container = new Container();

  public constructor(private readonly texture: Texture) {
    this.container.label = "reelsFrame";
  }

  public render(layout: SlotLayout["reels"]): void {
    const frame = layout.frame;
    const sprite = new Sprite(this.texture);
    const frameWidth = frame.width + 56;
    const frameHeight = frame.height + 54;
    const scale = Math.min(
      frameWidth / this.texture.width,
      frameHeight / this.texture.height
    );

    sprite.anchor.set(0.5);
    sprite.scale.set(scale);
    sprite.position.set(
      frame.x + frame.width / 2,
      frame.y + frame.height / 2
    );

    clearContainer(this.container);
    this.container.addChild(sprite);
  }
}
