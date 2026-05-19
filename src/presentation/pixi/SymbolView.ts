import { Container, Graphics, Text } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { RectLayout } from "../layout/SlotLayout";
import { symbolSkins } from "./SymbolSkin";

export class SymbolView {
  public create(symbol: SlotSymbol, layout: RectLayout): Container {
    const skin = symbolSkins[symbol];
    const container = new Container();
    const tile = new Graphics()
      .roundRect(layout.x, layout.y, layout.width, layout.height, 22)
      .fill(skin.fill)
      .stroke({
        color: skin.stroke,
        width: 6
      });
    const label = new Text({
      text: skin.label,
      style: {
        fill: "#ffffff",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: symbol === "seven" ? 82 : 52,
        fontWeight: "700"
      }
    });

    label.anchor.set(0.5);
    label.position.set(layout.x + layout.width / 2, layout.y + layout.height / 2);
    container.label = `symbol:${symbol}`;
    container.addChild(tile, label);

    return container;
  }
}
