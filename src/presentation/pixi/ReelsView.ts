import { Container, Graphics } from "pixi.js";

import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotLayout } from "../layout/SlotLayout";
import { clearContainer } from "./pixiContainerUtils";
import { SymbolView } from "./SymbolView";

export class ReelsView {
  public readonly container = new Container();

  public constructor(private readonly symbolView = new SymbolView()) {
    this.container.label = "reels";
  }

  public render(layout: SlotLayout["reels"], symbols: SlotSymbols): void {
    const [firstCell, secondCell, thirdCell] = layout.cells;
    const [firstSymbol, secondSymbol, thirdSymbol] = symbols;

    clearContainer(this.container);
    this.addCellBackgrounds(layout);
    this.container.addChild(
      this.symbolView.create(firstSymbol, firstCell),
      this.symbolView.create(secondSymbol, secondCell),
      this.symbolView.create(thirdSymbol, thirdCell)
    );
  }

  private addCellBackgrounds(layout: SlotLayout["reels"]): void {
    layout.cells.forEach((cell) => {
      const background = new Graphics()
        .roundRect(cell.x, cell.y, cell.width, cell.height, 22)
        .fill(0x0b1824);

      this.container.addChild(background);
    });
  }
}
