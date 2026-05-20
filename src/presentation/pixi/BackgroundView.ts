import { Container, Graphics, Sprite, Texture } from "pixi.js";

import type { SlotLayout } from "../layout/SlotLayout";

export class BackgroundView {
  public readonly container = new Container();
  private readonly sprite = new Sprite(Texture.EMPTY);
  private readonly shade = new Graphics();

  public constructor() {
    this.container.label = "background";
    this.container.addChild(this.sprite, this.shade);
  }

  public render(layout: SlotLayout, texture: Texture): void {
    const scale = Math.max(
      layout.scene.width / texture.width,
      layout.scene.height / texture.height
    );

    this.sprite.texture = texture;
    this.sprite.scale.set(scale);
    this.sprite.position.set(
      (layout.scene.width - texture.width * scale) / 2,
      (layout.scene.height - texture.height * scale) / 2
    );

    this.shade
      .clear()
      .rect(0, 0, layout.scene.width, layout.scene.height)
      .fill({
        color: 0x000000,
        alpha: 0.16
      });
  }
}
