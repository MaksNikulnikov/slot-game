import { gsap } from "gsap";
import type { Container } from "pixi.js";

type ReelLayers = readonly [Container, Container, Container];

export class ReelsAnimator {
  private readonly activeTweens: gsap.core.Tween[] = [];

  public start(layers: ReelLayers): void {
    this.stop();

    layers.forEach((layer, index) => {
      const tween = gsap.to(layer, {
        y: 26,
        alpha: 0.52,
        duration: 0.16,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.05
      });

      this.activeTweens.push(tween);
    });
  }

  public async settle(layers: ReelLayers): Promise<void> {
    this.stop();

    await Promise.all(
      layers.map(
        (layer, index) =>
          new Promise<void>((resolve) => {
            gsap.to(layer, {
              y: 0,
              alpha: 1,
              duration: 0.22 + index * 0.05,
              ease: "back.out(2)",
              onComplete: resolve
            });
          })
      )
    );
  }

  private stop(): void {
    this.activeTweens.forEach((tween) => {
      tween.kill();
    });
    this.activeTweens.length = 0;
  }
}
