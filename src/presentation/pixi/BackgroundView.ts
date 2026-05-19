import { Container, Graphics, Sprite } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";

export class BackgroundView {
  public readonly container = new Container();

  public constructor() {
    this.container.label = "background";
  }

  public render(layout: SlotLayout, texture: Texture): void {
    const sprite = new Sprite(texture);
    const scale = Math.max(
      layout.scene.width / texture.width,
      layout.scene.height / texture.height
    );
    const shade = new Graphics()
      .rect(0, 0, layout.scene.width, layout.scene.height)
      .fill({
        color: 0x000000,
        alpha: 0.16
      });

    sprite.scale.set(scale);
    sprite.position.set(
      (layout.scene.width - texture.width * scale) / 2,
      (layout.scene.height - texture.height * scale) / 2
    );

    clearContainer(this.container);
    this.container.addChild(sprite, shade);
  }
}
