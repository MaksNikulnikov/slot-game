import { Application } from "pixi.js";

import { createSlotLayout } from "../layout/createSlotLayout";
import { MainScene } from "./MainScene";

export class PixiSlotGame {
  private readonly app = new Application();
  private readonly mainScene = new MainScene();

  public constructor(private readonly rootElement: HTMLElement) {}

  public async initialize(): Promise<void> {
    await this.app.init({
      antialias: true,
      background: "#102231",
      resizeTo: this.rootElement
    });

    this.app.stage.label = "stage";
    this.rootElement.appendChild(this.app.canvas);
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
    const layout = createSlotLayout(viewport);
    const scale = Math.min(
      viewport.width / layout.scene.width,
      viewport.height / layout.scene.height
    );

    this.mainScene.container.scale.set(scale);
    this.mainScene.container.position.set(
      (viewport.width - layout.scene.width * scale) / 2,
      (viewport.height - layout.scene.height * scale) / 2
    );
    this.mainScene.render(layout);
  }
}
