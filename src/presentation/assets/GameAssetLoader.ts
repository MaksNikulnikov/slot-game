import "@esotericsoftware/spine-pixi-v8";

import { Assets } from "pixi.js";
import type { Spritesheet } from "pixi.js";
import type { Texture } from "pixi.js";

import { slotSymbols } from "../../core/slot/Symbol";
import type { SlotSymbol } from "../../core/slot/Symbol";
import type { GameAssets } from "./gameAssets";

export type AssetProgressHandler = (progress: number) => void;

export type LoadedGameAssets = {
  backgroundTexture: Texture;
  slotSymbolTextures: Record<SlotSymbol, Texture>;
  spineCharacter: {
    atlasAlias: string;
    skeletonAlias: string;
  };
};

export type GameAssetLoaderOptions = {
  assets: GameAssets;
  baseUrl: string;
};

export class GameAssetLoader {
  public constructor(private readonly options: GameAssetLoaderOptions) {}

  public async load(
    onProgress: AssetProgressHandler
  ): Promise<LoadedGameAssets> {
    const spineCharacter = this.options.assets.spineCharacter;

    Assets.add([
      {
        alias: spineCharacter.skeletonAlias,
        src: this.resolvePath(spineCharacter.skeletonPath)
      },
      {
        alias: spineCharacter.atlasAlias,
        src: this.resolvePath(spineCharacter.atlasPath)
      }
    ]);

    const backgroundTexture = await Assets.load<Texture>(
      this.resolvePath(this.options.assets.backgroundPath),
      (progress) => {
        onProgress(progress * 0.25);
      }
    );

    await Assets.load(
      [spineCharacter.skeletonAlias, spineCharacter.atlasAlias],
      (progress) => {
        onProgress(0.25 + progress * 0.45);
      }
    );

    const slotSymbolAtlas = await Assets.load<Spritesheet>(
      this.resolvePath(this.options.assets.slotSymbolAtlasPath),
      (progress) => {
        onProgress(0.7 + progress * 0.3);
      }
    );

    onProgress(1);

    return {
      backgroundTexture,
      slotSymbolTextures: this.resolveSlotSymbolTextures(slotSymbolAtlas),
      spineCharacter: {
        atlasAlias: spineCharacter.atlasAlias,
        skeletonAlias: spineCharacter.skeletonAlias
      }
    };
  }

  private resolvePath(path: string): string {
    return `${this.options.baseUrl}${path}`;
  }

  private resolveSlotSymbolTextures(
    atlas: Spritesheet
  ): Record<SlotSymbol, Texture> {
    const textures = {} as Record<SlotSymbol, Texture>;

    slotSymbols.forEach((symbol) => {
      const textureName = this.options.assets.slotSymbolTextureNames[symbol];
      const texture = atlas.textures[textureName];

      if (texture === undefined) {
        throw new Error(`Slot symbol texture "${textureName}" was not loaded`);
      }

      textures[symbol] = texture;
    });

    return textures;
  }
}
