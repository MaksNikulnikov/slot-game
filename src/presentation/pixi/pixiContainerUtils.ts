import type { Container } from "pixi.js";

export function clearContainer(container: Container): void {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
}
