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
  cell: number;
  x: number;
  y: number;
  r: number;
  phase: number;
};

const sparkles: readonly Sparkle[] = [
  { cell: 0, x: 0.18, y: -0.22, r: 4, phase: 0.05 },
  { cell: 0, x: 0.78, y: 0.18, r: 3, phase: 0.43 },
  { cell: 0, x: 0.52, y: -0.36, r: 5, phase: 0.74 },
  { cell: 1, x: 0.2, y: 0.28, r: 3, phase: 0.2 },
  { cell: 1, x: 0.5, y: -0.26, r: 5, phase: 0.57 },
  { cell: 1, x: 0.82, y: 0.22, r: 4, phase: 0.86 },
  { cell: 2, x: 0.22, y: -0.18, r: 4, phase: 0.32 },
  { cell: 2, x: 0.58, y: 0.32, r: 3, phase: 0.68 },
  { cell: 2, x: 0.86, y: -0.3, r: 5, phase: 0.12 }
];

export class WinLineView {
  public readonly container = new Container();
  private readonly dimLayer = new Graphics();
  private readonly auraLayer = new Graphics();
  private readonly connectorLayer = new Graphics();
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
    this.container.label = "winLine";
    this.container.visible = false;
    this.container.addChild(
      this.dimLayer,
      this.auraLayer,
      this.connectorLayer,
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
    this.container.visible = true;
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
    this.container.visible = false;
    this.clear();
  }

  private draw(): void {
    if (this.layout === null) {
      return;
    }

    const highlights = this.layout.cells.map((cell) =>
      createPaylineBand(cell)
    ) as [RectLayout, RectLayout, RectLayout];

    this.drawDim(this.layout, highlights);
    this.drawAuras(highlights);
    this.drawConnectors(highlights);
    this.drawComet(highlights);
    this.drawSparkles(highlights);
  }

  private clear(): void {
    this.dimLayer.clear();
    this.auraLayer.clear();
    this.connectorLayer.clear();
    this.cometLayer.clear();
    this.sparkleLayer.clear();
  }

  private drawDim(
    layout: SlotLayout["reels"],
    highlights: readonly RectLayout[]
  ): void {
    const frame = layout.frame;
    const firstHighlight = highlights[0];

    if (firstHighlight === undefined) {
      return;
    }

    const topHeight = Math.max(0, firstHighlight.y - frame.y);
    const bottomY = firstHighlight.y + firstHighlight.height;
    const bottomHeight = Math.max(0, frame.y + frame.height - bottomY);
    const alpha = this.state.reveal * 0.18;

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

  private drawAuras(highlights: readonly RectLayout[]): void {
    const reveal = this.state.reveal;
    const pulse = 0.55 + this.state.pulse * 0.45;

    this.auraLayer.clear();
    highlights.forEach((rect) => {
      const spread = 6 + this.state.pulse * 7;

      this.auraLayer
        .roundRect(
          rect.x - spread,
          rect.y - spread,
          rect.width + spread * 2,
          rect.height + spread * 2,
          24 + spread * 0.5
        )
        .stroke({
          color: 0xffbd36,
          alpha: reveal * 0.22 * pulse,
          width: 12
        })
        .roundRect(rect.x - 3, rect.y - 3, rect.width + 6, rect.height + 6, 25)
        .stroke({
          color: 0xf6a51f,
          alpha: reveal * 0.88,
          width: 6
        })
        .roundRect(rect.x + 4, rect.y + 4, rect.width - 8, rect.height - 8, 19)
        .stroke({
          color: 0xfff3b0,
          alpha: reveal * (0.62 + this.state.pulse * 0.24),
          width: 3
        })
        .roundRect(rect.x + 10, rect.y + 10, rect.width - 20, rect.height - 20, 15)
        .stroke({
          color: 0xffffff,
          alpha: reveal * 0.2,
          width: 2
        });
    });
  }

  private drawConnectors(highlights: readonly RectLayout[]): void {
    this.connectorLayer.clear();

    for (let index = 0; index < highlights.length - 1; index += 1) {
      const left = highlights[index];
      const right = highlights[index + 1];

      if (left === undefined || right === undefined) {
        continue;
      }

      const startX = left.x + left.width + 5;
      const endX = right.x - 5;
      const y = left.y + left.height / 2;

      this.connectorLayer
        .moveTo(startX, y)
        .lineTo(endX, y)
        .stroke({
          color: 0xffbd36,
          alpha: this.state.reveal * 0.5,
          width: 14
        })
        .moveTo(startX, y)
        .lineTo(endX, y)
        .stroke({
          color: 0xfff3b0,
          alpha: this.state.reveal * 0.94,
          width: 4
        })
        .circle(startX, y, 5)
        .fill({
          color: 0xfff3b0,
          alpha: this.state.reveal * 0.8
        })
        .circle(endX, y, 5)
        .fill({
          color: 0xfff3b0,
          alpha: this.state.reveal * 0.8
        });
    }
  }

  private drawComet(highlights: readonly [RectLayout, RectLayout, RectLayout]): void {
    const point = getCometPoint(highlights, this.state.comet);
    const alpha = this.state.reveal * Math.sin(this.state.comet * Math.PI);

    this.cometLayer.clear();

    if (alpha <= 0) {
      return;
    }

    this.cometLayer
      .circle(point.x, point.y, 15)
      .fill({
        color: 0xffbd36,
        alpha: alpha * 0.16
      })
      .circle(point.x, point.y, 6)
      .fill({
        color: 0xffffff,
        alpha: alpha * 0.5
      })
      .circle(point.x, point.y, 2.5)
      .fill({
        color: 0xffffff,
        alpha
      });
  }

  private drawSparkles(highlights: readonly RectLayout[]): void {
    this.sparkleLayer.clear();
    sparkles.forEach((sparkle) => {
      const rect = highlights[sparkle.cell];

      if (rect === undefined) {
        return;
      }

      const cycle = (this.state.sparkle + sparkle.phase) % 1;
      const twinkle = Math.sin(cycle * Math.PI);
      const alpha =
        this.state.reveal * twinkle * (0.32 + this.state.pulse * 0.34);
      const radius = sparkle.r * (0.8 + twinkle * 1.15);
      const x = rect.x + rect.width * sparkle.x;
      const y = rect.y + rect.height * (0.5 + sparkle.y);

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

function createPaylineBand(cell: RectLayout): RectLayout {
  const bandHeight = Math.min(112, cell.height / 3 - 7);

  return {
    x: cell.x + 10,
    y: cell.y + cell.height / 2 - bandHeight / 2,
    width: cell.width - 20,
    height: bandHeight
  };
}

function getCometPoint(
  highlights: readonly [RectLayout, RectLayout, RectLayout],
  progress: number
): { x: number; y: number } {
  const first = highlights[0];
  const last = highlights[2];
  const eased = gsap.parseEase("sine.inOut")(progress);

  return {
    x: first.x + (last.x + last.width - first.x) * eased,
    y: first.y + 11
  };
}
