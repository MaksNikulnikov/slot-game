import { Container, Graphics } from "pixi.js";

import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";
import { SymbolView } from "./SymbolView";

export class ReelsView {
  public readonly container = new Container();
  private readonly backgroundLayer = new Container();
  private readonly symbolLayers: [Container, Container, Container] = [
    new Container(),
    new Container(),
    new Container()
  ];

  public constructor(private readonly symbolView = new SymbolView()) {
    this.container.label = "reels";
    this.backgroundLayer.label = "reels/backgrounds";
    this.symbolLayers.forEach((layer, index) => {
      layer.label = `reels/symbolLayer-${index}`;
    });
    this.container.addChild(this.backgroundLayer, ...this.symbolLayers);
  }

  public render(layout: SlotLayout["reels"], symbols: SlotSymbols): void {
    const [firstCell, secondCell, thirdCell] = layout.cells;
    const [firstSymbol, secondSymbol, thirdSymbol] = symbols;

    clearContainer(this.backgroundLayer);
    this.symbolLayers.forEach((layer) => {
      clearContainer(layer);
    });
    this.addCellBackgrounds(layout);
    this.symbolLayers[0].addChild(this.symbolView.create(firstSymbol, firstCell));
    this.symbolLayers[1].addChild(
      this.symbolView.create(secondSymbol, secondCell)
    );
    this.symbolLayers[2].addChild(this.symbolView.create(thirdSymbol, thirdCell));
  }

  public getSymbolLayers(): readonly [Container, Container, Container] {
    return this.symbolLayers;
  }

  private addCellBackgrounds(layout: SlotLayout["reels"]): void {
    layout.cells.forEach((cell) => {
      const background = new Graphics()
        .roundRect(cell.x, cell.y, cell.width, cell.height, 22)
        .fill(0x0b1824);

      this.backgroundLayer.addChild(background);
    });
  }
}
