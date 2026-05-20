import { Container, Graphics, Sprite, Texture } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { RectLayout } from "../layout/SlotLayout";

export type SymbolDisplay = {
  container: Container;
  shadow: Graphics;
  sprite: Sprite;
};

export class SymbolView {
  public createDisplay(): SymbolDisplay {
    const container = new Container();
    const shadow = new Graphics();
    const sprite = new Sprite(Texture.EMPTY);

    sprite.anchor.set(0.5);
    container.addChild(shadow, sprite);

    return {
      container,
      shadow,
      sprite
    };
  }

  public render(
    display: SymbolDisplay,
    symbol: SlotSymbol,
    texture: Texture,
    layout: RectLayout
  ): void {
    display.container.label = `symbol:${symbol}`;
    display.shadow
      .clear()
      .ellipse(0, 18, layout.width * 0.32, layout.height * 0.16)
      .fill({
        color: 0x000000,
        alpha: 0.16
      });

    const maxSpriteWidth = layout.width * 0.78;
    const maxSpriteHeight = layout.height * 0.82;
    const spriteScale = Math.min(
      maxSpriteWidth / texture.width,
      maxSpriteHeight / texture.height
    );

    display.sprite.texture = texture;
    display.sprite.scale.set(spriteScale);
    display.sprite.position.set(
      layout.x + layout.width / 2,
      layout.y + layout.height / 2
    );
  }
}
