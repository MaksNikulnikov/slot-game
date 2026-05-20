import { Container, Sprite } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotLayout } from "../layout/SlotLayout";

export class ReelsFrameView {
  public readonly container = new Container();
  private readonly sprite: Sprite;

  public constructor(private readonly texture: Texture) {
    this.sprite = new Sprite(this.texture);
    this.sprite.anchor.set(0.5);
    this.container.label = "reelsFrame";
    this.container.addChild(this.sprite);
  }

  public render(layout: SlotLayout["reels"]): void {
    const frame = layout.frame;
    const frameWidth = frame.width + 56;
    const frameHeight = frame.height + 54;
    const scale = Math.min(
      frameWidth / this.texture.width,
      frameHeight / this.texture.height
    );

    this.sprite.scale.set(scale);
    this.sprite.position.set(
      frame.x + frame.width / 2,
      frame.y + frame.height / 2
    );
  }
}
