import { Container, Text } from "pixi.js";

import { getVisibleSymbols } from "../../core/slot/SpinResult";
import type { SpinResult } from "../../core/slot/SpinResult";
import type { LoadedGameAssets } from "../assets/GameAssetLoader";
import type { SlotLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";
import { BackgroundView } from "./BackgroundView";
import { MuteButtonView } from "./MuteButtonView";
import { ReelsFrameView } from "./ReelsFrameView";
import { ReelsShadowView } from "./ReelsShadowView";
import { ReelsView } from "./ReelsView";
import { SpineCharacterView } from "./SpineCharacterView";
import { SpinButtonView } from "./SpinButtonView";

export type CompletionViewState = {
  result: SpinResult;
  isMuted: boolean;
};

export type CompletionViewOptions = {
  assets: LoadedGameAssets;
  onSpin(): void;
  onToggleSound(): void;
};

export class CompletionView {
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
  private readonly resultLabel = new Text({
    text: "",
    style: {
      fill: "#f8e7b0",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: 42,
      fontWeight: "700"
    }
  });
  private readonly characterView: SpineCharacterView;
  private readonly reelsFrameView: ReelsFrameView;
  private readonly reelsView: ReelsView;
  private readonly reelsShadowView = new ReelsShadowView();
  private readonly muteButtonView: MuteButtonView;
  private readonly spinButtonView: SpinButtonView;

  public constructor(options: CompletionViewOptions) {
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

    this.container.label = "completionView";
    this.title.anchor.set(0.5);
    this.resultLabel.anchor.set(0.5);
    this.container.addChild(
      this.backgroundView.container,
      this.title,
      this.characterView.container,
      this.reelsView.container,
      this.reelsShadowView.container,
      this.reelsFrameView.container,
      this.resultLabel,
      this.muteButtonView.container,
      this.spinButtonView.container
    );
  }

  public render(layout: SlotLayout, state: CompletionViewState): void {
    this.backgroundView.render(layout, this.assets.backgroundTexture);
    this.title.position.set(layout.title.x, layout.title.y);
    this.characterView.render(
      layout.character,
      state.result.isWin ? "win" : "lose"
    );
    this.reelsView.render(
      layout.reels,
      getVisibleSymbols(state.result.matrix),
      false,
      state.result.winningLines
    );
    this.reelsShadowView.render(layout.reels);
    this.reelsFrameView.render(layout.reels);
    this.renderResultLabel(layout, state.result);
    this.muteButtonView.render(layout.muteButton, state.isMuted);
    this.spinButtonView.render(layout.spinButton, true);
  }

  private renderResultLabel(layout: SlotLayout, result: SpinResult): void {
    this.resultLabel.text = result.isWin ? gameText.win : gameText.lose;
    this.resultLabel.style.fill = result.isWin ? "#f8e7b0" : "#9fb4c7";
    this.resultLabel.position.set(
      layout.resultBanner.x + layout.resultBanner.width / 2,
      layout.resultBanner.y + layout.resultBanner.height / 2
    );
  }
}
