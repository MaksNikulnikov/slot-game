import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { Container } from "pixi.js";

import type { LoadedGameAssets } from "../assets/GameAssetLoader";
import type { RectLayout } from "../layout/SlotLayout";

export type SpineCharacterMood = "idle" | "win" | "lose";

const idleAnimation = "idle";
const winAnimation = "jump";
const loseAnimation = "death";

export class SpineCharacterView {
  public readonly container = new Container();
  private readonly spine: Spine;
  private readonly naturalBounds: { width: number; height: number };
  private currentMood: SpineCharacterMood | null = null;

  public constructor(assets: LoadedGameAssets["spineCharacter"]) {
    this.spine = Spine.from({
      skeleton: assets.skeletonAlias,
      atlas: assets.atlasAlias,
      autoUpdate: true
    });
    this.applyMood("idle");
    this.spine.update(0);

    const bounds = this.spine.getLocalBounds();

    this.naturalBounds = {
      width: bounds.width,
      height: bounds.height
    };
    this.spine.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height);

    this.container.label = "spineCharacter";
    this.container.addChild(this.spine);
  }

  public render(layout: RectLayout, mood: SpineCharacterMood): void {
    const scale = Math.min(
      layout.width / this.naturalBounds.width,
      layout.height / this.naturalBounds.height
    );

    this.spine.position.set(
      layout.x + layout.width / 2,
      layout.y + layout.height - 8
    );
    this.spine.scale.set(scale);
    this.applyMood(mood);
  }

  private applyMood(mood: SpineCharacterMood): void {
    if (this.currentMood === mood) {
      return;
    }

    this.currentMood = mood;

    switch (mood) {
      case "idle":
        this.spine.state.setAnimation(0, idleAnimation, true);
        this.spine.state.timeScale = 1;
        this.spine.alpha = 1;
        this.spine.rotation = 0;
        return;

      case "win":
        this.spine.state.setAnimation(0, winAnimation, false);
        this.spine.state.addAnimation(0, idleAnimation, true, 0);
        this.spine.state.timeScale = 1.2;
        this.spine.alpha = 1;
        this.spine.rotation = 0;
        return;

      case "lose":
        this.spine.state.setAnimation(0, loseAnimation, false);
        this.spine.state.addAnimation(0, idleAnimation, true, 0.4);
        this.spine.state.timeScale = 1;
        this.spine.alpha = 0.82;
        this.spine.rotation = 0;
        return;
    }
  }
}
