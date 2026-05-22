import { Application } from "pixi.js";
import type { Container } from "pixi.js";

import { getVisibleSymbols } from "../../core/slot/SpinResult";
import type { SlotMatrix } from "../../core/slot/Symbol";
import { ReelsAnimator } from "../animation/ReelsAnimator";
import type { GameAssetLoader } from "../assets/GameAssetLoader";
import type { LoadedGameAssets } from "../assets/GameAssetLoader";
import type { SlotLayout, SlotViewport } from "../layout/SlotLayout";
import { CompletionView } from "./CompletionView";
import type { CompletionViewState } from "./CompletionView";
import { LoadingView } from "./LoadingView";
import { SlotGameView } from "./SlotGameView";
import type { SlotGameViewState } from "./SlotGameView";
import { fitSceneIntoViewport } from "./fitSceneIntoViewport";

export type PixiGameRendererOptions = {
  assetLoader: GameAssetLoader;
  createLayout(viewport: SlotViewport): SlotLayout;
};

export type SlotGameSceneOptions = {
  onSpin(): void;
  onToggleSound(): void;
};

export type CompletionSceneOptions = {
  onSpin(): void;
  onToggleSound(): void;
};

export class PixiGameRenderer {
  private readonly app = new Application();
  private readonly loadingView = new LoadingView();
  private readonly reelsAnimator = new ReelsAnimator();
  private loadedAssets: LoadedGameAssets | null = null;
  private slotGameView: SlotGameView | null = null;
  private completionView: CompletionView | null = null;
  private resizeHandler: (() => void) | null = null;

  public constructor(
    private readonly rootElement: HTMLElement,
    private readonly options: PixiGameRendererOptions
  ) {}

  public async initialize(): Promise<void> {
    await this.app.init({
      antialias: true,
      background: "#102231",
      resizeTo: this.rootElement
    });

    this.app.stage.label = "stage";
    this.rootElement.appendChild(this.app.canvas);
    this.syncViewport();
    window.addEventListener("resize", this.handleResize);
  }

  public onResize(handler: () => void): void {
    this.resizeHandler = handler;
  }

  public async loadAssets(
    onProgress: (progress: number) => void
  ): Promise<void> {
    this.loadedAssets = await this.options.assetLoader.load(onProgress);
  }

  public showLoadingScene(): void {
    this.setActiveContainer(this.loadingView.container);
  }

  public renderLoading(progress: number): void {
    this.loadingView.render(this.getViewport(), progress);
  }

  public showSlotGameScene(options: SlotGameSceneOptions): void {
    const assets = this.getLoadedAssets();

    if (this.slotGameView === null) {
      this.slotGameView = new SlotGameView({
        assets,
        onSpin: options.onSpin,
        onToggleSound: options.onToggleSound
      });
    }

    this.setActiveContainer(this.slotGameView.container);
  }

  public renderSlotGame(state: SlotGameViewState): void {
    if (this.slotGameView === null) {
      return;
    }

    const viewport = this.getViewport();
    const layout = this.options.createLayout(viewport);

    fitSceneIntoViewport(this.slotGameView.container, layout.scene, viewport);
    this.slotGameView.render(layout, state);
  }

  public startReelSpin(): void {
    if (this.slotGameView === null) {
      return;
    }

    this.reelsAnimator.start(this.slotGameView.getReelViews());
  }

  public async settleReels(matrix: SlotMatrix): Promise<void> {
    if (this.slotGameView === null) {
      return;
    }

    await this.reelsAnimator.settle(
      this.slotGameView.getReelViews(),
      getVisibleSymbols(matrix)
    );
  }

  public stopReels(): void {
    if (this.slotGameView === null) {
      return;
    }

    this.reelsAnimator.stopAndClear(this.slotGameView.getReelViews());
  }

  public showCompletionScene(options: CompletionSceneOptions): void {
    const assets = this.getLoadedAssets();

    if (this.completionView === null) {
      this.completionView = new CompletionView({
        assets,
        onSpin: options.onSpin,
        onToggleSound: options.onToggleSound
      });
    }

    this.setActiveContainer(this.completionView.container);
  }

  public renderCompletion(state: CompletionViewState): void {
    if (this.completionView === null) {
      return;
    }

    const viewport = this.getViewport();
    const layout = this.options.createLayout(viewport);

    fitSceneIntoViewport(this.completionView.container, layout.scene, viewport);
    this.completionView.render(layout, state);
  }

  private readonly handleResize = (): void => {
    requestAnimationFrame(() => {
      this.syncViewport();
      this.resizeHandler?.();
    });
  };

  private setActiveContainer(container: Container): void {
    this.loadingView.container.removeFromParent();
    this.slotGameView?.container.removeFromParent();
    this.completionView?.container.removeFromParent();
    this.app.stage.addChild(container);
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

  private getLoadedAssets(): LoadedGameAssets {
    if (this.loadedAssets === null) {
      throw new Error("Game assets were not loaded");
    }

    return this.loadedAssets;
  }
}
