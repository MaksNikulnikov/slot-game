import type { Container } from "pixi.js";

import type { SlotLayout, SlotViewport } from "../layout/SlotLayout";

export function fitSceneIntoViewport(
  scene: Container,
  layout: SlotLayout["scene"],
  viewport: SlotViewport
): void {
  const scale = Math.min(
    viewport.width / layout.width,
    viewport.height / layout.height
  );

  scene.scale.set(scale);
  scene.position.set(
    (viewport.width - layout.width * scale) / 2,
    (viewport.height - layout.height * scale) / 2
  );
}
