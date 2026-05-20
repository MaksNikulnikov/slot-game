import { Container } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotLayout } from "../layout/SlotLayout";
import { SlotReelView } from "./SlotReelView";
import { WinLineView } from "./WinLineView";

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
  private readonly chromeLayer = new Container();
  private readonly winLineView = new WinLineView();
  private readonly symbolLayer = new Container();
  private readonly overlayLayer = new Container();
  private readonly reelViews: [SlotReelView, SlotReelView, SlotReelView];

  public constructor(symbolTextures: Record<SlotSymbol, Texture>) {
    this.reelViews = [
      new SlotReelView(reelSequences[0], symbolTextures),
      new SlotReelView(reelSequences[1], symbolTextures),
      new SlotReelView(reelSequences[2], symbolTextures)
    ];
    this.container.label = "reels";
    this.chromeLayer.label = "reels/chrome";
    this.symbolLayer.label = "reels/symbols";
    this.overlayLayer.label = "reels/overlay";
    this.reelViews.forEach((reelView, index) => {
      reelView.chromeContainer.label = `reels/reel-${index}/chrome`;
      reelView.symbolContainer.label = `reels/reel-${index}/symbols`;
      reelView.overlayContainer.label = `reels/reel-${index}/overlay`;
    });
    this.chromeLayer.addChild(
      this.reelViews[0].chromeContainer,
      this.reelViews[1].chromeContainer,
      this.reelViews[2].chromeContainer
    );
    this.symbolLayer.addChild(
      this.reelViews[0].symbolContainer,
      this.reelViews[1].symbolContainer,
      this.reelViews[2].symbolContainer
    );
    this.overlayLayer.addChild(
      this.reelViews[0].overlayContainer,
      this.reelViews[1].overlayContainer,
      this.reelViews[2].overlayContainer
    );
    this.container.addChild(
      this.chromeLayer,
      this.winLineView.backlightContainer,
      this.symbolLayer,
      this.winLineView.foregroundContainer,
      this.overlayLayer
    );
  }

  public render(
    layout: SlotLayout["reels"],
    symbols: SlotSymbols,
    isSpinning: boolean,
    isWin: boolean
  ): void {
    const [firstCell, secondCell, thirdCell] = layout.cells;
    const [firstSymbol, secondSymbol, thirdSymbol] = symbols;

    this.reelViews[0].render(firstCell, firstSymbol, isSpinning);
    this.reelViews[1].render(secondCell, secondSymbol, isSpinning);
    this.reelViews[2].render(thirdCell, thirdSymbol, isSpinning);
    this.winLineView.render(layout, isWin);
  }

  public getReelViews(): readonly [
    SlotReelView,
    SlotReelView,
    SlotReelView
  ] {
    return this.reelViews;
  }
}
