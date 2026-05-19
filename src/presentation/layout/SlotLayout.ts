export type SlotViewport = {
  width: number;
  height: number;
};

export type RectLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PointLayout = {
  x: number;
  y: number;
};

export type SlotLayout = {
  scene: {
    width: number;
    height: number;
  };
  title: PointLayout;
  reels: {
    frame: RectLayout;
    cells: readonly [RectLayout, RectLayout, RectLayout];
  };
  spinButton: RectLayout;
  muteButton: RectLayout;
  character: RectLayout;
  outcomeBanner: RectLayout;
};
