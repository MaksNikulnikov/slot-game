import { Container, Graphics, Sprite } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { RectLayout } from "../layout/SlotLayout";
import { symbolSkins } from "./SymbolSkin";

export class SymbolView {
  public create(
    symbol: SlotSymbol,
    texture: Texture,
    layout: RectLayout
  ): Container {
    const skin = symbolSkins[symbol];
    const container = new Container();
    const shadow = new Graphics()
      .roundRect(
        layout.x + 9,
        layout.y + 12,
        layout.width - 18,
        layout.height - 16,
        26
      )
      .fill({
        color: 0x000000,
        alpha: 0.28
      });
    const tile = new Graphics()
      .roundRect(layout.x, layout.y, layout.width, layout.height, 22)
      .fill({
        color: skin.fill,
        alpha: 0.94
      })
      .stroke({
        color: skin.stroke,
        width: 5
      });
    const innerGlow = new Graphics()
      .roundRect(
        layout.x + 10,
        layout.y + 10,
        layout.width - 20,
        layout.height - 20,
        18
      )
      .stroke({
        color: 0xffffff,
        alpha: 0.2,
        width: 3
      });
    const sprite = new Sprite(texture);
    const maxSpriteWidth = layout.width * 0.72;
    const maxSpriteHeight = layout.height * 0.76;
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
    container.addChild(shadow, tile, innerGlow, sprite);

    return container;
  }
}
