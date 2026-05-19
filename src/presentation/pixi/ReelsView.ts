import { Container } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotLayout } from "../layout/SlotLayout";
import { SlotReelView } from "./SlotReelView";

const reelSequences = [
  ["cherry", "lemon", "seven"],
  ["lemon", "seven", "cherry"],
  ["seven", "cherry", "lemon"]
] as const satisfies readonly [
  readonly SlotSymbol[],
  readonly SlotSymbol[],
  readonly SlotSymbol[]
];

export class ReelsView {
  public readonly container = new Container();
  private readonly reelViews: [SlotReelView, SlotReelView, SlotReelView];

  public constructor(symbolTextures: Record<SlotSymbol, Texture>) {
    this.reelViews = [
      new SlotReelView(reelSequences[0], symbolTextures),
      new SlotReelView(reelSequences[1], symbolTextures),
      new SlotReelView(reelSequences[2], symbolTextures)
    ];
    this.container.label = "reels";
    this.reelViews.forEach((reelView, index) => {
      reelView.container.label = `reels/reel-${index}`;
    });
    this.container.addChild(
      this.reelViews[0].container,
      this.reelViews[1].container,
      this.reelViews[2].container
    );
  }

  public render(
    layout: SlotLayout["reels"],
    symbols: SlotSymbols,
    isSpinning: boolean
  ): void {
    const [firstCell, secondCell, thirdCell] = layout.cells;
    const [firstSymbol, secondSymbol, thirdSymbol] = symbols;

    this.reelViews[0].render(firstCell, firstSymbol, isSpinning);
    this.reelViews[1].render(secondCell, secondSymbol, isSpinning);
    this.reelViews[2].render(thirdCell, thirdSymbol, isSpinning);
  }

  public getReelViews(): readonly [
    SlotReelView,
    SlotReelView,
    SlotReelView
  ] {
    return this.reelViews;
  }
}
