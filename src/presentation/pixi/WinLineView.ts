import { gsap } from "gsap";
import { Container, Graphics } from "pixi.js";

import type { RectLayout, SlotLayout } from "../layout/SlotLayout";

type WinLineState = {
  reveal: number;
  comet: number;
  pulse: number;
  sparkle: number;
};

type Sparkle = {
  x: number;
  y: number;
  r: number;
  phase: number;
};

const sparkles: readonly Sparkle[] = [
  { x: 0.07, y: -0.28, r: 4, phase: 0.05 },
  { x: 0.16, y: 0.24, r: 3, phase: 0.43 },
  { x: 0.29, y: -0.34, r: 5, phase: 0.74 },
  { x: 0.39, y: 0.3, r: 3, phase: 0.2 },
  { x: 0.5, y: -0.3, r: 5, phase: 0.57 },
  { x: 0.61, y: 0.24, r: 4, phase: 0.86 },
  { x: 0.73, y: -0.2, r: 4, phase: 0.32 },
  { x: 0.84, y: 0.32, r: 3, phase: 0.68 },
  { x: 0.93, y: -0.3, r: 5, phase: 0.12 }
];

export class WinLineView {
  public readonly backlightContainer = new Container();
  public readonly foregroundContainer = new Container();
  private readonly dimLayer = new Graphics();
  private readonly auraLayer = new Graphics();
  private readonly panelLayer = new Graphics();
  private readonly cometLayer = new Graphics();
  private readonly sparkleLayer = new Graphics();
  private readonly state: WinLineState = {
    reveal: 0,
    comet: 0,
    pulse: 0,
    sparkle: 0
  };
  private timeline: gsap.core.Timeline | null = null;
  private layout: SlotLayout["reels"] | null = null;
  private isActive = false;

  public constructor() {
    this.backlightContainer.label = "winLine/backlight";
    this.foregroundContainer.label = "winLine/foreground";
    this.backlightContainer.visible = false;
    this.foregroundContainer.visible = false;
    this.backlightContainer.addChild(
      this.dimLayer,
      this.auraLayer,
      this.panelLayer
    );
    this.foregroundContainer.addChild(
      this.cometLayer,
      this.sparkleLayer
    );
  }

  public render(layout: SlotLayout["reels"], isWin: boolean): void {
    this.layout = layout;

    if (!isWin) {
      this.hide();
      return;
    }

    if (!this.isActive) {
      this.start();
      return;
    }

    this.draw();
  }

  private start(): void {
    this.timeline?.kill();
    this.isActive = true;
    this.backlightContainer.visible = true;
    this.foregroundContainer.visible = true;
    this.state.reveal = 0;
    this.state.comet = 0;
    this.state.pulse = 0;
    this.state.sparkle = 0;
    this.draw();

    this.timeline = gsap.timeline();
    this.timeline
      .to(this.state, {
        reveal: 1,
        duration: 0.34,
        ease: "power3.out",
        onUpdate: () => {
          this.draw();
        }
      })
      .to(
        this.state,
        {
          comet: 1,
          duration: 0.95,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 0.22,
          onRepeat: () => {
            this.state.comet = 0;
          },
          onUpdate: () => {
            this.draw();
          }
        },
        "-=0.1"
      )
      .to(
        this.state,
        {
          sparkle: 1,
          duration: 1.24,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            this.draw();
          }
        },
        "-=0.92"
      )
      .to(
        this.state,
        {
          pulse: 1,
          duration: 0.82,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          onUpdate: () => {
            this.draw();
          }
        },
        "-=1.18"
      );
  }

  private hide(): void {
    if (!this.isActive) {
      return;
    }

    this.timeline?.kill();
    this.timeline = null;
    this.isActive = false;
    this.backlightContainer.visible = false;
    this.foregroundContainer.visible = false;
    this.clear();
  }

  private draw(): void {
    if (this.layout === null) {
      return;
    }

    const paylineBand = createPaylineBand(this.layout);

    this.drawDim(this.layout, paylineBand);
    this.drawAuras(paylineBand);
    this.drawPanel(paylineBand);
    this.drawComet(paylineBand);
    this.drawSparkles(paylineBand);
  }

  private clear(): void {
    this.dimLayer.clear();
    this.auraLayer.clear();
    this.panelLayer.clear();
    this.cometLayer.clear();
    this.sparkleLayer.clear();
  }

  private drawDim(layout: SlotLayout["reels"], paylineBand: RectLayout): void {
    const frame = layout.frame;
    const topHeight = Math.max(0, paylineBand.y - frame.y);
    const bottomY = paylineBand.y + paylineBand.height;
    const bottomHeight = Math.max(0, frame.y + frame.height - bottomY);
    const alpha = this.state.reveal * 0.12;

    this.dimLayer.clear();
    this.dimLayer
      .roundRect(frame.x + 24, frame.y + 24, frame.width - 48, topHeight - 6, 20)
      .fill({
        color: 0x000000,
        alpha
      })
      .roundRect(frame.x + 24, bottomY + 6, frame.width - 48, bottomHeight - 30, 20)
      .fill({
        color: 0x000000,
        alpha
      });
  }

  private drawAuras(paylineBand: RectLayout): void {
    const reveal = this.state.reveal;
    const pulse = 0.55 + this.state.pulse * 0.45;
    const outerXSpread = 14;
    const innerXSpread = 8;
    const outerYSpread = 9 + this.state.pulse * 17;
    const innerYSpread = 4 + this.state.pulse * 10;
    const radiusPulse = this.state.pulse * 6;

    this.auraLayer.clear();
    this.auraLayer
      .roundRect(
        paylineBand.x - outerXSpread,
        paylineBand.y - outerYSpread,
        paylineBand.width + outerXSpread * 2,
        paylineBand.height + outerYSpread * 2,
        38 + radiusPulse
      )
      .fill({
        color: 0xff8f00,
        alpha: reveal * 0.18 * pulse
      })
      .roundRect(
        paylineBand.x - innerXSpread,
        paylineBand.y - innerYSpread,
        paylineBand.width + innerXSpread * 2,
        paylineBand.height + innerYSpread * 2,
        34 + radiusPulse * 0.75
      )
      .fill({
        color: 0xffd65c,
        alpha: reveal * 0.24 * pulse
      })
      .roundRect(
        paylineBand.x - 7,
        paylineBand.y - 7,
        paylineBand.width + 14,
        paylineBand.height + 14,
        34
      )
      .stroke({
        color: 0xfff0a6,
        alpha: reveal * 0.58 * pulse,
        width: 10
      });
  }

  private drawPanel(paylineBand: RectLayout): void {
    const reveal = this.state.reveal;
    const pulse = 0.62 + this.state.pulse * 0.38;
    const centerY = paylineBand.y + paylineBand.height / 2;
    const railInset = 10;

    this.panelLayer.clear();
    this.panelLayer
      .roundRect(
        paylineBand.x,
        paylineBand.y,
        paylineBand.width,
        paylineBand.height,
        30
      )
      .fill({
        color: 0xffb625,
        alpha: reveal * 0.34
      })
      .roundRect(
        paylineBand.x + 3,
        paylineBand.y + 3,
        paylineBand.width - 6,
        paylineBand.height - 6,
        28
      )
      .stroke({
        color: 0xfff0a8,
        alpha: reveal * (0.78 + this.state.pulse * 0.12),
        width: 4
      })
      .roundRect(
        paylineBand.x + 8,
        paylineBand.y + 12,
        paylineBand.width - 16,
        paylineBand.height - 24,
        24
      )
      .fill({
        color: 0xffffff,
        alpha: reveal * 0.28 * pulse
      })
      .roundRect(
        paylineBand.x + railInset,
        paylineBand.y + 8,
        paylineBand.width - railInset * 2,
        13,
        8
      )
      .fill({
        color: 0xffffff,
        alpha: reveal * 0.38 * pulse
      })
      .roundRect(
        paylineBand.x + railInset,
        paylineBand.y + paylineBand.height - 22,
        paylineBand.width - railInset * 2,
        13,
        8
      )
      .fill({
        color: 0x8f3b00,
        alpha: reveal * 0.26
      })
      .moveTo(paylineBand.x + 18, centerY)
      .lineTo(paylineBand.x + paylineBand.width - 18, centerY)
      .stroke({
        color: 0xffffff,
        alpha: reveal * (0.58 + this.state.pulse * 0.22),
        width: 4
      });
  }

  private drawComet(paylineBand: RectLayout): void {
    const point = getCometPoint(paylineBand, this.state.comet);
    const alpha = this.state.reveal * Math.sin(this.state.comet * Math.PI);

    this.cometLayer.clear();

    if (alpha <= 0) {
      return;
    }

    this.cometLayer
      .circle(point.x, point.y, 22)
      .fill({
        color: 0xffbd36,
        alpha: alpha * 0.24
      })
      .circle(point.x, point.y, 10)
      .fill({
        color: 0xffffff,
        alpha: alpha * 0.58
      })
      .circle(point.x, point.y, 2.5)
      .fill({
        color: 0xffffff,
        alpha
      });
  }

  private drawSparkles(paylineBand: RectLayout): void {
    this.sparkleLayer.clear();
    sparkles.forEach((sparkle) => {
      const cycle = (this.state.sparkle + sparkle.phase) % 1;
      const twinkle = Math.sin(cycle * Math.PI);
      const alpha =
        this.state.reveal * twinkle * (0.32 + this.state.pulse * 0.34);
      const radius = sparkle.r * (0.8 + twinkle * 1.15);
      const x = paylineBand.x + paylineBand.width * sparkle.x;
      const y = paylineBand.y + paylineBand.height * (0.5 + sparkle.y);

      this.sparkleLayer
        .moveTo(x - radius, y)
        .lineTo(x + radius, y)
        .stroke({
          color: 0xffffff,
          alpha,
          width: 2
        })
        .moveTo(x, y - radius)
        .lineTo(x, y + radius)
        .stroke({
          color: 0xffffff,
          alpha,
          width: 2
        })
        .circle(x, y, radius * 0.32)
        .fill({
          color: 0xfff3b0,
          alpha
        });
    });
  }
}

function createPaylineBand(layout: SlotLayout["reels"]): RectLayout {
  const first = layout.cells[0];
  const last = layout.cells[2];
  const bandHeight = Math.min(126, first.height / 3 + 16);
  const sideBleed = Math.min(34, first.width * 0.2);

  return {
    x: first.x - sideBleed,
    y: first.y + first.height / 2 - bandHeight / 2,
    width: last.x + last.width - first.x + sideBleed * 2,
    height: bandHeight
  };
}

function getCometPoint(paylineBand: RectLayout, progress: number): { x: number; y: number } {
  const eased = gsap.parseEase("sine.inOut")(progress);

  return {
    x: paylineBand.x + (paylineBand.width - 28) * eased + 14,
    y: paylineBand.y + 15
  };
}
