import { Application } from "pixi.js";

import type { SpinOutcome } from "../../core/slot/SpinOutcome";
import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotGameSession } from "../SlotGameSession";
import type { SlotLayout, SlotViewport } from "../layout/SlotLayout";
import { MainScene } from "./MainScene";
import { fitSceneIntoViewport } from "./fitSceneIntoViewport";

export type PixiSlotGameOptions = {
  createLayout(viewport: SlotViewport): SlotLayout;
  initialSymbols: SlotSymbols;
  session: SlotGameSession;
};

export class PixiSlotGame {
  private readonly app = new Application();
  private readonly mainScene = new MainScene({
    onSpin: () => {
      void this.handleSpin();
    }
  });
  private currentSymbols: SlotSymbols;
  private currentOutcome: SpinOutcome | null = null;
  private isSpinning = false;

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
    this.app.stage.addChild(this.mainScene.container);
    this.render();

    window.addEventListener("resize", this.handleResize);
  }

  private readonly handleResize = (): void => {
    requestAnimationFrame(() => {
      this.render();
    });
  };

  private render(): void {
    const viewport = {
      width: this.app.screen.width,
      height: this.app.screen.height
    };
    const layout = this.options.createLayout(viewport);

    fitSceneIntoViewport(this.mainScene.container, layout.scene, viewport);
    this.mainScene.render(layout, {
      symbols: this.currentSymbols,
      isSpinning: this.isSpinning,
      outcome: this.currentOutcome
    });
  }

  private async handleSpin(): Promise<void> {
    if (this.isSpinning) {
      return;
    }

    this.isSpinning = true;
    this.currentOutcome = null;
    this.render();

    const outcome = await this.options.session.spin();

    this.currentSymbols = outcome.symbols;
    this.currentOutcome = outcome;
    this.isSpinning = false;
    this.render();
  }

  private syncViewport(): void {
    this.app.resize();
  }
}
