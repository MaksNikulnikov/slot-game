import { Container, Text } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { LoadedGameAssets } from "../assets/GameAssetLoader";
import type { SlotLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { BackgroundView } from "./BackgroundView";
import { OutcomeBannerView } from "./OutcomeBannerView";
import { clearContainer } from "./pixiContainerUtils";
import { ReelsFrameView } from "./ReelsFrameView";
import { ReelsView } from "./ReelsView";
import { SpineCharacterView } from "./SpineCharacterView";
import { SpinButtonView } from "./SpinButtonView";

export type MainSceneState = {
  symbols: SlotSymbols;
  isSpinning: boolean;
  outcome: SpinOutcome | null;
};

export type MainSceneOptions = {
  assets: LoadedGameAssets;
  onSpin(): void;
};

export class MainScene {
  public readonly container = new Container();
  private readonly assets: LoadedGameAssets;
  private readonly backgroundView = new BackgroundView();
  private readonly titleLayer = new Container();
  private readonly reelsFrameView = new ReelsFrameView();
  private readonly reelsView = new ReelsView();
  private readonly spinButtonView: SpinButtonView;
  private readonly outcomeBannerView = new OutcomeBannerView();
  private readonly characterView: SpineCharacterView;

  public constructor(options: MainSceneOptions) {
    this.assets = options.assets;
    this.characterView = new SpineCharacterView(options.assets.spineCharacter);
    this.spinButtonView = new SpinButtonView({
      onTap: options.onSpin
    });

    this.container.label = "mainScene";
    this.container.addChild(
      this.backgroundView.container,
      this.titleLayer,
      this.characterView.container,
      this.reelsFrameView.container,
      this.reelsView.container,
      this.outcomeBannerView.container,
      this.spinButtonView.container
    );
  }

  public render(layout: SlotLayout, state: MainSceneState): void {
    this.backgroundView.render(layout, this.assets.backgroundTexture);
    this.addTitle(layout);
    this.characterView.render(layout.character, this.getCharacterMood(state));
    this.reelsFrameView.render(layout.reels);
    this.reelsView.render(layout.reels, state.symbols);
    this.outcomeBannerView.render(layout.outcomeBanner, state.outcome);
    this.spinButtonView.render(layout.spinButton, !state.isSpinning);
  }

  public getReelSymbolLayers(): readonly [Container, Container, Container] {
    return this.reelsView.getSymbolLayers();
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

  private getCharacterMood(state: MainSceneState): "idle" | "win" | "lose" {
    if (state.outcome === null) {
      return "idle";
    }

    return state.outcome.isWin ? "win" : "lose";
  }
}
