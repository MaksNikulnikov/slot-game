import { Container, Graphics, Text } from "pixi.js";

import type { SlotLayout } from "../layout/SlotLayout";
import { gameText } from "../text/gameText";

export class MainScene {
  public readonly container = new Container();

  public render(layout: SlotLayout): void {
    this.container.removeChildren().forEach((child) => {
      child.destroy({ children: true });
    });

    this.addBackground(layout);
    this.addTitle(layout);
    this.addReelsFrame(layout);
    this.addSpinButton(layout);
    this.addMuteButton(layout);
    this.addCharacterPlaceholder(layout);
  }

  private addBackground(layout: SlotLayout): void {
    const background = new Graphics()
      .rect(0, 0, layout.scene.width, layout.scene.height)
      .fill(0x102231);

    background.label = "background";
    this.container.addChild(background);
  }

  private addTitle(layout: SlotLayout): void {
    const title = new Text({
      text: gameText.title,
      style: {
        fill: "#f8e7b0",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 42,
        fontWeight: "700"
      }
    });

    title.anchor.set(0.5);
    title.position.set(layout.title.x, layout.title.y);
    title.label = "title";
    this.container.addChild(title);
  }

  private addReelsFrame(layout: SlotLayout): void {
    const frame = new Graphics()
      .roundRect(
        layout.reelsFrame.x,
        layout.reelsFrame.y,
        layout.reelsFrame.width,
        layout.reelsFrame.height,
        28
      )
      .fill(0x22384f)
      .stroke({
        color: 0xf3c86a,
        width: 8
      });

    frame.label = "reelsFrame";
    this.container.addChild(frame);
  }

  private addSpinButton(layout: SlotLayout): void {
    const button = new Graphics()
      .roundRect(
        layout.spinButton.x,
        layout.spinButton.y,
        layout.spinButton.width,
        layout.spinButton.height,
        18
      )
      .fill(0xd94f36);

    const label = new Text({
      text: gameText.spin,
      style: {
        fill: "#ffffff",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 32,
        fontWeight: "700"
      }
    });

    label.anchor.set(0.5);
    label.position.set(
      layout.spinButton.x + layout.spinButton.width / 2,
      layout.spinButton.y + layout.spinButton.height / 2
    );
    button.label = "spinButton";
    label.label = "spinButtonLabel";
    this.container.addChild(button, label);
  }

  private addMuteButton(layout: SlotLayout): void {
    const button = new Graphics()
      .circle(
        layout.muteButton.x + layout.muteButton.width / 2,
        layout.muteButton.y + layout.muteButton.height / 2,
        layout.muteButton.width / 2
      )
      .fill(0x315a73);

    const label = new Text({
      text: gameText.soundOn,
      style: {
        fill: "#ffffff",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
        fontSize: 28,
        fontWeight: "700"
      }
    });

    label.anchor.set(0.5);
    label.position.set(
      layout.muteButton.x + layout.muteButton.width / 2,
      layout.muteButton.y + layout.muteButton.height / 2
    );
    button.label = "muteButton";
    label.label = "muteButtonLabel";
    this.container.addChild(button, label);
  }

  private addCharacterPlaceholder(layout: SlotLayout): void {
    const character = new Graphics()
      .roundRect(
        layout.character.x,
        layout.character.y,
        layout.character.width,
        layout.character.height,
        24
      )
      .fill(0x4f6b45)
      .stroke({
        color: 0x9ccc79,
        width: 5
      });

    character.label = "characterPlaceholder";
    this.container.addChild(character);
  }
}
