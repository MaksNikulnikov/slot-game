import { Container, Graphics, Text } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { CharacterPlaceholderView } from "./CharacterPlaceholderView";
import { OutcomeBannerView } from "./OutcomeBannerView";
import { clearContainer } from "./pixiContainerUtils";
import { ReelsFrameView } from "./ReelsFrameView";
import { ReelsView } from "./ReelsView";
import { SpinButtonView } from "./SpinButtonView";

export type MainSceneState = {
  symbols: SlotSymbols;
  isSpinning: boolean;
  outcome: SpinOutcome | null;
};

export type MainSceneOptions = {
  onSpin(): void;
};

export class MainScene {
  public readonly container = new Container();
  private readonly backgroundLayer = new Container();
  private readonly titleLayer = new Container();
  private readonly reelsFrameView = new ReelsFrameView();
  private readonly reelsView = new ReelsView();
  private readonly spinButtonView: SpinButtonView;
  private readonly outcomeBannerView = new OutcomeBannerView();
  private readonly characterView = new CharacterPlaceholderView();

  public constructor(options: MainSceneOptions) {
    this.spinButtonView = new SpinButtonView({
      onTap: options.onSpin
    });

    this.container.label = "mainScene";
    this.container.addChild(
      this.backgroundLayer,
      this.titleLayer,
      this.characterView.container,
      this.reelsFrameView.container,
      this.reelsView.container,
      this.outcomeBannerView.container,
      this.spinButtonView.container
    );
  }

  public render(layout: SlotLayout, state: MainSceneState): void {
    this.addBackground(layout);
    this.addTitle(layout);
    this.characterView.render(layout.character);
    this.reelsFrameView.render(layout.reels);
    this.reelsView.render(layout.reels, state.symbols);
    this.outcomeBannerView.render(layout.outcomeBanner, state.outcome);
    this.spinButtonView.render(layout.spinButton, !state.isSpinning);
  }

  private addBackground(layout: SlotLayout): void {
    const background = new Graphics()
      .rect(0, 0, layout.scene.width, layout.scene.height)
      .fill(0x102231);

    background.label = "background";
    clearContainer(this.backgroundLayer);
    this.backgroundLayer.addChild(background);
  }

  private addTitle(layout: SlotLayout): void {
    const title = new Text({
      text: gameText.title,
      style: {
        fill: "#f8e7b0",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 42,
        fontWeight: "700"
      }
    });

    title.anchor.set(0.5);
    title.position.set(layout.title.x, layout.title.y);
    title.label = "title";
    clearContainer(this.titleLayer);
    this.titleLayer.addChild(title);
  }
}
