import type { SlotLayout } from "./SlotLayout";

const sceneWidth = 1280;
const sceneHeight = 720;

export function createSlotLayout(): SlotLayout {
  const reelsFrame = {
    x: 285,
    y: 145,
    width: 720,
    height: 385
  };
  const reelPadding = 34;
  const reelGap = 22;
  const reelWidth = (reelsFrame.width - reelPadding * 2 - reelGap * 2) / 3;
  const reelHeight = reelsFrame.height - reelPadding * 2;
  const firstReelX = reelsFrame.x + reelPadding;
  const reelY = reelsFrame.y + reelPadding;

  return {
    scene: {
      width: sceneWidth,
      height: sceneHeight
    },
    title: {
      x: sceneWidth / 2,
      y: 74
    },
    reels: {
      frame: reelsFrame,
      cells: [
        {
          x: firstReelX,
          y: reelY,
          width: reelWidth,
          height: reelHeight
        },
        {
          x: firstReelX + reelWidth + reelGap,
          y: reelY,
          width: reelWidth,
          height: reelHeight
        },
        {
          x: firstReelX + (reelWidth + reelGap) * 2,
          y: reelY,
          width: reelWidth,
          height: reelHeight
        }
      ]
    },
    spinButton: {
      x: 526,
      y: 585,
      width: 228,
      height: 78
    },
    muteButton: {
      x: 1136,
      y: 34,
      width: 72,
      height: 72
    },
    character: {
      x: 76,
      y: 220,
      width: 178,
      height: 260
    },
    resultBanner: {
      x: 425,
      y: 537,
      width: 430,
      height: 42
    }
  };
}
