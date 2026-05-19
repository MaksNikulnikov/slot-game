import type { SlotLayout, SlotViewport } from "./SlotLayout";

const sceneWidth = 1280;
const sceneHeight = 720;

export function createSlotLayout(_viewport: SlotViewport): SlotLayout {
  return {
    scene: {
      width: sceneWidth,
      height: sceneHeight
    },
    title: {
      x: sceneWidth / 2,
      y: 74
    },
    reelsFrame: {
      x: 290,
      y: 190,
      width: 700,
      height: 230
    },
    spinButton: {
      x: 526,
      y: 490,
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
      y: 190,
      width: 178,
      height: 260
    }
  };
}
