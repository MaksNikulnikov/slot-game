import { Container, Graphics, Sprite } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { RectLayout } from "../layout/SlotLayout";

export class SymbolView {
  public create(
    symbol: SlotSymbol,
    texture: Texture,
    layout: RectLayout
  ): Container {
    const container = new Container();
    const shadow = new Graphics()
      .ellipse(0, 18, layout.width * 0.32, layout.height * 0.16)
      .fill({
        color: 0x000000,
        alpha: 0.16
      });
    const sprite = new Sprite(texture);
    const maxSpriteWidth = layout.width * 0.78;
    const maxSpriteHeight = layout.height * 0.82;
    const spriteScale = Math.min(
      maxSpriteWidth / texture.width,
      maxSpriteHeight / texture.height
    );

    sprite.anchor.set(0.5);
    sprite.scale.set(spriteScale);
    sprite.position.set(
      layout.x + layout.width / 2,
      layout.y + layout.height / 2
    );
    container.label = `symbol:${symbol}`;
    container.addChild(shadow, sprite);

    return container;
  }
}
