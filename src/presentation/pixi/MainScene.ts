import { Container, Text } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { LoadedGameAssets } from "../assets/GameAssetLoader";
import type { SlotLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { BackgroundView } from "./BackgroundView";
import { OutcomeBannerView } from "./OutcomeBannerView";
import { MuteButtonView } from "./MuteButtonView";
import { ReelsFrameView } from "./ReelsFrameView";
import { ReelsShadowView } from "./ReelsShadowView";
import { ReelsView } from "./ReelsView";
import type { SlotReelView } from "./SlotReelView";
import { SpineCharacterView } from "./SpineCharacterView";
import { SpinButtonView } from "./SpinButtonView";

export type MainSceneState = {
  symbols: SlotSymbols;
  isSpinning: boolean;
  isMuted: boolean;
  outcome: SpinOutcome | null;
};

export type MainSceneOptions = {
  assets: LoadedGameAssets;
  onToggleSound(): void;
  onSpin(): void;
};

export class MainScene {
  public readonly container = new Container();
  private readonly assets: LoadedGameAssets;
  private readonly backgroundView = new BackgroundView();
  private readonly title = new Text({
    text: gameText.title,
    style: {
      fill: "#f8e7b0",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 42,
      fontWeight: "700"
    }
  });
  private readonly reelsFrameView: ReelsFrameView;
  private readonly reelsView: ReelsView;
  private readonly reelsShadowView = new ReelsShadowView();
  private readonly muteButtonView: MuteButtonView;
  private readonly spinButtonView: SpinButtonView;
  private readonly outcomeBannerView = new OutcomeBannerView();
  private readonly characterView: SpineCharacterView;

  public constructor(options: MainSceneOptions) {
    this.assets = options.assets;
    this.characterView = new SpineCharacterView(options.assets.spineCharacter);
    this.reelsFrameView = new ReelsFrameView(
      options.assets.slotReelsFrameTexture
    );
    this.reelsView = new ReelsView(options.assets.slotSymbolTextures);
    this.muteButtonView = new MuteButtonView({
      onTap: options.onToggleSound
    });
    this.spinButtonView = new SpinButtonView({
      onTap: options.onSpin
    });

    this.container.label = "mainScene";
    this.title.anchor.set(0.5);
    this.title.label = "title";
    this.container.addChild(
      this.backgroundView.container,
      this.title,
      this.characterView.container,
      this.reelsView.container,
      this.reelsShadowView.container,
      this.reelsFrameView.container,
      this.outcomeBannerView.container,
      this.muteButtonView.container,
      this.spinButtonView.container
    );
  }

  public render(layout: SlotLayout, state: MainSceneState): void {
    this.backgroundView.render(layout, this.assets.backgroundTexture);
    this.renderTitle(layout);
    this.characterView.render(layout.character, this.getCharacterMood(state));
    this.reelsView.render(
      layout.reels,
      state.symbols,
      state.isSpinning,
      state.outcome?.isWin === true
    );
    this.reelsShadowView.render(layout.reels);
    this.reelsFrameView.render(layout.reels);
    this.outcomeBannerView.render(layout.outcomeBanner, state.outcome);
    this.muteButtonView.render(layout.muteButton, state.isMuted);
    this.spinButtonView.render(layout.spinButton, !state.isSpinning);
  }

  public getReelViews(): readonly [
    SlotReelView,
    SlotReelView,
    SlotReelView
  ] {
    return this.reelsView.getReelViews();
  }

  private renderTitle(layout: SlotLayout): void {
    this.title.position.set(layout.title.x, layout.title.y);
  }

  private getCharacterMood(state: MainSceneState): "idle" | "win" | "lose" {
    if (state.outcome === null) {
      return "idle";
    }

    return state.outcome.isWin ? "win" : "lose";
  }
}
