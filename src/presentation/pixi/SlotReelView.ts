import { Container, Graphics } from "pixi.js";
import type { Texture } from "pixi.js";

import type { SlotSymbol } from "../../core/slot/Symbol";
import type { RectLayout } from "../layout/SlotLayout";
import { SymbolView } from "./SymbolView";
import type { SymbolDisplay } from "./SymbolView";

const visibleSlotOffsets = [-3, -2, -1, 0, 1, 2, 3] as const;

type ReelTile = {
  display: SymbolDisplay;
  symbol: SlotSymbol | null;
};

export class SlotReelView {
  public readonly chromeContainer = new Container();
  public readonly symbolContainer = new Container();
  public readonly overlayContainer = new Container();
  private readonly chromeBackground = new Graphics();
  private readonly chromeInnerShade = new Graphics();
  private readonly chromeCenterSheen = new Graphics();
  private readonly chromePaylineGlow = new Graphics();
  private readonly symbolLayer = new Container();
  private readonly maskShape = new Graphics();
  private readonly curvatureLayer = new Container();
  private readonly curvatureSideShade = new Graphics();
  private readonly curvatureCenterGlow = new Graphics();
  private readonly tiles: ReelTile[];
  private layout: RectLayout | null = null;
  private symbolStep = 0;
  private symbolLayout: RectLayout = {
    x: 0,
    y: 0,
    width: 1,
    height: 1
  };
  private currentOffset = 0;
  private spinIntensity = 0;

  public constructor(
    private readonly sequence: readonly SlotSymbol[],
    private readonly textures: Record<SlotSymbol, Texture>,
    private readonly symbolView = new SymbolView()
  ) {
    this.tiles = visibleSlotOffsets.map(() => ({
      display: this.symbolView.createDisplay(),
      symbol: null
    }));

    this.chromeContainer.label = "slotReel/chrome";
    this.symbolContainer.label = "slotReel/symbolContainer";
    this.overlayContainer.label = "slotReel/overlay";
    this.symbolLayer.label = "slotReel/symbols";
    this.maskShape.label = "slotReel/mask";
    this.maskShape.alpha = 0;
    this.curvatureLayer.label = "slotReel/curvature";
    this.symbolLayer.addChild(
      ...this.tiles.map((tile) => tile.display.container)
    );
    this.symbolLayer.mask = this.maskShape;
    this.chromeContainer.addChild(
      this.chromeBackground,
      this.chromeCenterSheen,
      this.chromeInnerShade,
      this.chromePaylineGlow
    );
    this.symbolContainer.addChild(this.symbolLayer, this.maskShape);
    this.overlayContainer.addChild(this.curvatureLayer);
    this.curvatureLayer.addChild(
      this.curvatureSideShade,
      this.curvatureCenterGlow
    );
  }

  public get offset(): number {
    return this.currentOffset;
  }

  public render(
    layout: RectLayout,
    centerSymbol: SlotSymbol,
    isSpinning: boolean
  ): void {
    const isNewLayout = this.hasLayoutChanged(layout);

    this.layout = layout;
    this.chromeContainer.position.set(layout.x, layout.y);
    this.symbolContainer.position.set(layout.x, layout.y);
    this.overlayContainer.position.set(layout.x, layout.y);
    this.symbolStep = layout.height / 3;
    this.symbolLayout = this.createSymbolLayout(layout);

    if (isNewLayout) {
      this.renderChrome(layout);
      this.renderMask(layout);
      this.renderCurvature(layout);
      this.tiles.forEach((tile) => {
        tile.symbol = null;
      });
    }

    if (!isSpinning) {
      this.setOffset(this.findNearestOffsetForSymbol(centerSymbol));
      this.setSpinIntensity(0);
    }
  }

  public setOffset(offset: number): void {
    this.currentOffset = offset;
    this.renderOffset();
  }

  public getStopOffset(symbol: SlotSymbol, minAdvance: number): number {
    const targetIndex = this.sequence.indexOf(symbol);

    if (targetIndex < 0) {
      throw new Error(`Symbol "${symbol}" is not present in the reel sequence`);
    }

    let targetOffset = Math.ceil(this.currentOffset + minAdvance);

    while (wrapIndex(targetOffset, this.sequence.length) !== targetIndex) {
      targetOffset += 1;
    }

    return targetOffset;
  }

  public setSpinIntensity(value: number): void {
    this.spinIntensity = Math.max(0, Math.min(1, value));
  }

  private renderOffset(): void {
    if (this.layout === null) {
      return;
    }

    const layout = this.layout;
    const baseIndex = Math.floor(this.currentOffset);
    const progress = this.currentOffset - baseIndex;
    const centerY = layout.height / 2;
    const wheelRadius = layout.height * 0.48;

    visibleSlotOffsets.forEach((slotOffset, tileIndex) => {
      const tile = this.tiles[tileIndex];
      const symbolIndex = wrapIndex(
        baseIndex - slotOffset,
        this.sequence.length
      );
      const symbol = this.sequence[symbolIndex];

      if (tile === undefined || symbol === undefined) {
        return;
      }

      if (tile.symbol !== symbol) {
        this.renderTile(tile, symbol);
      }

      const wheelPosition = slotOffset + progress;
      const normalizedWheelPosition = Math.max(
        -1,
        Math.min(1, wheelPosition / 1.6)
      );
      const edgeAmount = Math.abs(normalizedWheelPosition);
      const curveAmount = Math.cos(edgeAmount * (Math.PI / 2));
      const projectedY = centerY + Math.sin(
        normalizedWheelPosition * (Math.PI / 2)
      ) * wheelRadius;
      const xScale = 1 - edgeAmount ** 1.35 * 0.1;
      const yScale =
        1 - edgeAmount ** 1.12 * (0.54 + this.spinIntensity * 0.12);

      tile.display.container.position.set(
        layout.width / 2,
        projectedY
      );
      tile.display.container.alpha =
        0.2 + curveAmount * 0.8 - this.spinIntensity * edgeAmount * 0.08;
      tile.display.container.scale.set(
        xScale,
        yScale
      );
    });
  }

  private renderTile(tile: ReelTile, symbol: SlotSymbol): void {
    tile.symbol = symbol;
    this.symbolView.render(
      tile.display,
      symbol,
      this.textures[symbol],
      this.symbolLayout
    );
  }

  private renderChrome(layout: RectLayout): void {
    this.chromeBackground
      .clear()
      .roundRect(0, 0, layout.width, layout.height, 28)
      .fill(0xf5efe1)
      .stroke({
        color: 0xffd980,
        width: 4
      });

    this.chromeInnerShade
      .clear()
      .roundRect(8, 8, layout.width - 16, layout.height - 16, 22)
      .stroke({
        color: 0x8f6a2a,
        alpha: 0.2,
        width: 3
      });

    this.chromeCenterSheen
      .clear()
      .roundRect(12, layout.height / 2 - 66, layout.width - 24, 132, 28)
      .fill({
        color: 0xffffff,
        alpha: 0.2
      });

    this.chromePaylineGlow
      .clear()
      .roundRect(10, layout.height / 2 - 54, layout.width - 20, 108, 26)
      .stroke({
        color: 0xffcc4d,
        alpha: 0.26,
        width: 4
      });
  }

  private renderMask(layout: RectLayout): void {
    this.maskShape.clear();
    this.maskShape.roundRect(0, 0, layout.width, layout.height, 24);
    this.maskShape.fill(0xffffff);
  }

  private renderCurvature(layout: RectLayout): void {
    this.curvatureSideShade
      .clear()
      .roundRect(0, 0, layout.width, layout.height, 24)
      .stroke({
        color: 0x000000,
        alpha: 0.2,
        width: 16
      });

    this.curvatureCenterGlow
      .clear()
      .roundRect(14, layout.height / 2 - 60, layout.width - 28, 120, 32)
      .stroke({
        color: 0xffffff,
        alpha: 0.24,
        width: 5
      });
  }

  private createSymbolLayout(layout: RectLayout): RectLayout {
    const width = layout.width - 28;
    const height = Math.min(112, this.symbolStep - 13);

    return {
      x: -width / 2,
      y: -height / 2,
      width,
      height
    };
  }

  private findNearestOffsetForSymbol(symbol: SlotSymbol): number {
    const targetIndex = this.sequence.indexOf(symbol);

    if (targetIndex < 0) {
      throw new Error(`Symbol "${symbol}" is not present in the reel sequence`);
    }

    const currentTurn = Math.floor(this.currentOffset / this.sequence.length);
    let offset = currentTurn * this.sequence.length + targetIndex;

    if (Math.abs(offset - this.currentOffset) > this.sequence.length / 2) {
      offset +=
        offset < this.currentOffset
          ? this.sequence.length
          : -this.sequence.length;
    }

    return offset;
  }

  private hasLayoutChanged(layout: RectLayout): boolean {
    return (
      this.layout === null ||
      this.layout.x !== layout.x ||
      this.layout.y !== layout.y ||
      this.layout.width !== layout.width ||
      this.layout.height !== layout.height
    );
  }
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
