import { Application } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotGameSession } from "../SlotGameSession";
import { ReelsAnimator } from "../animation/ReelsAnimator";
import type { AudioController } from "../audio/AudioController";
import type { GameAssetLoader } from "../assets/GameAssetLoader";
import type { LoadedGameAssets } from "../assets/GameAssetLoader";
import type { SlotLayout, SlotViewport } from "../layout/SlotLayout";
import { LoadingScreen } from "./LoadingScreen";
import { MainScene } from "./MainScene";
import { fitSceneIntoViewport } from "./fitSceneIntoViewport";

export type PixiSlotGameOptions = {
  assetLoader: GameAssetLoader;
  audio: AudioController;
  createLayout(viewport: SlotViewport): SlotLayout;
  initialSymbols: SlotSymbols;
  session: SlotGameSession;
};

export class PixiSlotGame {
  private readonly app = new Application();
  private readonly loadingScreen = new LoadingScreen();
  private readonly reelsAnimator = new ReelsAnimator();
  private mainScene!: MainScene;
  private currentSymbols: SlotSymbols;
  private currentOutcome: SpinOutcome | null = null;
  private isSpinning = false;
  private loadingProgress = 0;
  private loadedAssets!: LoadedGameAssets;

  public constructor(
    private readonly rootElement: HTMLElement,
    private readonly options: PixiSlotGameOptions
  ) {
    this.currentSymbols = options.initialSymbols;
  }

  public async initialize(): Promise<void> {
    await this.app.init({
      antialias: true,
      background: "#102231",
      resizeTo: this.rootElement
    });

    this.app.stage.label = "stage";
    this.rootElement.appendChild(this.app.canvas);
    this.syncViewport();
    this.app.stage.addChild(this.loadingScreen.container);
    this.renderLoading();

    this.loadedAssets = await this.options.assetLoader.load((progress) => {
      this.loadingProgress = progress;
      this.renderLoading();
    });

    this.syncViewport();
    this.loadingScreen.container.removeFromParent();
    this.loadingScreen.destroy();
    this.mainScene = new MainScene({
      assets: this.loadedAssets,
      onToggleSound: () => {
        this.handleToggleSound();
      },
      onSpin: () => {
        void this.handleSpin();
      }
    });
    this.app.stage.addChild(this.mainScene.container);
    this.renderMainScene();

    window.addEventListener("resize", this.handleResize);
  }

  private readonly handleResize = (): void => {
    requestAnimationFrame(() => {
      this.renderMainScene();
    });
  };

  private renderLoading(): void {
    this.loadingScreen.render(this.getViewport(), this.loadingProgress);
  }

  private renderMainScene(): void {
    const viewport = this.getViewport();
    const layout = this.options.createLayout(viewport);

    fitSceneIntoViewport(this.mainScene.container, layout.scene, viewport);
    this.mainScene.render(
      layout,
      {
        symbols: this.currentSymbols,
        isSpinning: this.isSpinning,
        isMuted: this.options.audio.isMuted,
        outcome: this.currentOutcome
      }
    );
  }

  private async handleSpin(): Promise<void> {
    if (this.isSpinning) {
      return;
    }

    this.isSpinning = true;
    this.currentOutcome = null;
    this.renderMainScene();
    await this.options.audio.startBackgroundLoop();
    this.reelsAnimator.start(this.mainScene.getReelSymbolLayers());

    const outcome = await this.options.session.spin();

    this.currentSymbols = outcome.symbols;
    this.currentOutcome = outcome;
    this.renderMainScene();
    if (outcome.isWin) {
      void this.options.audio.playWin();
    }
    await this.reelsAnimator.settle(this.mainScene.getReelSymbolLayers());

    this.isSpinning = false;
    this.renderMainScene();
  }

  private getViewport(): SlotViewport {
    return {
      width: this.app.screen.width,
      height: this.app.screen.height
    };
  }

  private syncViewport(): void {
    this.app.resize();
  }

  private handleToggleSound(): void {
    this.options.audio.toggleMute();
    void this.options.audio.startBackgroundLoop();
    this.renderMainScene();
  }
}
