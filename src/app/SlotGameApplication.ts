import { SlotGameStateMachine } from "../core/game/SlotGameStateMachine";
import type { SpinResult } from "../core/slot/SpinResult";
import type { SlotMatrix } from "../core/slot/Symbol";
import type { SlotGameSession } from "./SlotGameSession";

type AppScene = "loading" | "game" | "completion";

export type SlotGameRenderer = {
  initialize(): Promise<void>;
  loadAssets(onProgress: (progress: number) => void): Promise<void>;
  onResize(handler: () => void): void;
  showLoadingScene(): void;
  renderLoading(progress: number): void;
  showSlotGameScene(options: {
    onSpin(): void;
    onToggleSound(): void;
  }): void;
  renderSlotGame(state: {
    matrix: SlotMatrix;
    isSpinning: boolean;
    isMuted: boolean;
  }): void;
  startReelSpin(): void;
  settleReels(matrix: SlotMatrix): Promise<void>;
  stopReels(): void;
  showCompletionScene(options: {
    onSpin(): void;
    onToggleSound(): void;
  }): void;
  renderCompletion(state: {
    result: SpinResult;
    isMuted: boolean;
  }): void;
};

export type SlotGameAudio = {
  readonly isMuted: boolean;
  load(onProgress: (progress: number) => void): Promise<void>;
  toggleMute(): boolean;
  startBackgroundLoop(): Promise<void>;
  playClick(): Promise<void>;
  playWin(): Promise<void>;
};

export type SlotGameApplicationOptions = {
  audio: SlotGameAudio;
  initialMatrix: SlotMatrix;
  renderer: SlotGameRenderer;
  session: SlotGameSession;
};

export class SlotGameApplication {
  private readonly stateMachine: SlotGameStateMachine;
  private activeScene: AppScene = "loading";
  private loadingProgress = 0;

  public constructor(private readonly options: SlotGameApplicationOptions) {
    this.stateMachine = new SlotGameStateMachine(options.initialMatrix);
  }

  public async start(): Promise<void> {
    await this.options.renderer.initialize();
    this.options.renderer.onResize(() => {
      this.renderActiveScene();
    });

    this.showLoadingScene();

    await this.options.renderer.loadAssets((progress) => {
      this.loadingProgress = progress * 0.82;
      this.renderLoadingScene();
    });
    await this.options.audio.load((progress) => {
      this.loadingProgress = 0.82 + progress * 0.18;
      this.renderLoadingScene();
    });

    this.loadingProgress = 1;
    this.renderLoadingScene();
    this.showGameScene();
  }

  private showLoadingScene(): void {
    this.activeScene = "loading";
    this.options.renderer.showLoadingScene();
    this.renderLoadingScene();
  }

  private renderLoadingScene(): void {
    this.options.renderer.renderLoading(this.loadingProgress);
  }

  private showGameScene(): void {
    this.activeScene = "game";
    this.options.renderer.showSlotGameScene({
      onSpin: () => {
        void this.handleSpin();
      },
      onToggleSound: () => {
        this.handleToggleSound();
      }
    });
    this.renderGameScene();
  }

  private renderGameScene(): void {
    const state = this.stateMachine.state;

    this.options.renderer.renderSlotGame({
      matrix: state.matrix,
      isSpinning: state.phase === "spinning" || state.phase === "settling",
      isMuted: this.options.audio.isMuted
    });
  }

  private showCompletionScene(result: SpinResult): void {
    this.activeScene = "completion";
    this.options.renderer.showCompletionScene({
      onSpin: () => {
        void this.handleSpin();
      },
      onToggleSound: () => {
        this.handleToggleSound();
      }
    });
    this.renderCompletionScene(result);
  }

  private renderCompletionScene(result: SpinResult): void {
    this.options.renderer.renderCompletion({
      result,
      isMuted: this.options.audio.isMuted
    });
  }

  private renderActiveScene(): void {
    if (this.activeScene === "loading") {
      this.renderLoadingScene();
      return;
    }

    if (this.activeScene === "game") {
      this.renderGameScene();
      return;
    }

    const result = this.stateMachine.state.result;

    if (result !== null) {
      this.renderCompletionScene(result);
    }
  }

  private async handleSpin(): Promise<void> {
    if (!this.stateMachine.canSpin) {
      return;
    }

    this.stateMachine.dispatch({ type: "spinRequested" });
    void this.options.audio.playClick();
    this.showGameScene();

    try {
      await this.options.audio.startBackgroundLoop();
      this.options.renderer.startReelSpin();

      const result = await this.options.session.spin();

      this.stateMachine.dispatch({ type: "spinReceived", result });
      await this.options.renderer.settleReels(result.matrix);
      this.stateMachine.dispatch({ type: "settleFinished" });
      this.renderGameScene();

      if (result.isWin) {
        void this.options.audio.playWin();
      }

      this.showCompletionScene(result);
    } catch (error) {
      this.options.renderer.stopReels();
      this.stateMachine.dispatch({
        type: "spinFailed",
        message: getErrorMessage(error)
      });
      this.renderGameScene();
    }
  }

  private handleToggleSound(): void {
    const wasMuted = this.options.audio.isMuted;

    if (!wasMuted) {
      void this.options.audio.playClick();
    }

    this.options.audio.toggleMute();
    void this.options.audio.startBackgroundLoop();

    if (wasMuted) {
      void this.options.audio.playClick();
    }

    this.renderActiveScene();
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
