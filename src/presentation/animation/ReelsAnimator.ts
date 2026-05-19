import { gsap } from "gsap";

import type { SlotSymbols } from "../../core/slot/Symbol";
import type { SlotReelView } from "../pixi/SlotReelView";

type ReelViews = readonly [SlotReelView, SlotReelView, SlotReelView];

const spinTweenDistance = 240;
const spinTweenDurationSeconds = 10;
const settleAdvanceByReel = [12, 17, 22] as const;
const settleDurationByReel = [0.95, 1.2, 1.48] as const;

export class ReelsAnimator {
  private readonly activeTweens: gsap.core.Tween[] = [];

  public start(reels: ReelViews): void {
    this.stop();

    reels.forEach((reel, index) => {
      const state = {
        offset: reel.offset
      };
      const tween = gsap.to(state, {
        offset: state.offset + spinTweenDistance + index * 18,
        duration: spinTweenDurationSeconds,
        ease: "none",
        onStart: () => {
          reel.setSpinIntensity(1);
        },
        onUpdate: () => {
          reel.setOffset(state.offset);
        }
      });

      this.activeTweens.push(tween);
    });
  }

  public async settle(reels: ReelViews, symbols: SlotSymbols): Promise<void> {
    this.stop();

    await Promise.all(
      reels.map(
        (reel, index) =>
          new Promise<void>((resolve) => {
            const targetSymbol = symbols[index];

            if (targetSymbol === undefined) {
              resolve();
              return;
            }

            const state = {
              offset: reel.offset
            };
            const minAdvance =
              settleAdvanceByReel[index] ?? settleAdvanceByReel[0];
            const duration =
              settleDurationByReel[index] ?? settleDurationByReel[0];
            const targetOffset = reel.getStopOffset(
              targetSymbol,
              minAdvance
            );

            gsap.to(state, {
              offset: targetOffset,
              duration,
              ease: "back.out(0.72)",
              delay: index * 0.08,
              onStart: () => {
                reel.setSpinIntensity(0.82);
              },
              onUpdate: () => {
                reel.setOffset(state.offset);
              },
              onComplete: () => {
                reel.setOffset(targetOffset);
                reel.setSpinIntensity(0);
                resolve();
              }
            });
          })
      )
    );
  }

  public stopAndClear(reels: ReelViews): void {
    this.stop();
    reels.forEach((reel) => {
      reel.setSpinIntensity(0);
    });
  }

  private stop(): void {
    this.activeTweens.forEach((tween) => {
      tween.kill();
    });
    this.activeTweens.length = 0;
  }
}
