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
  slotReelsFrameTexture: Texture;
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

    const slotMachineAtlas = await Assets.load<Spritesheet>(
      this.resolvePath(this.options.assets.slotMachineAtlasPath),
      (progress) => {
        onProgress(0.7 + progress * 0.15);
      }
    );

    const slotSymbolAtlas = await Assets.load<Spritesheet>(
      this.resolvePath(this.options.assets.slotSymbolAtlasPath),
      (progress) => {
        onProgress(0.85 + progress * 0.15);
      }
    );

    onProgress(1);

    return {
      backgroundTexture,
      slotReelsFrameTexture: this.resolveTexture(
        slotMachineAtlas,
        this.options.assets.slotReelsFrameTextureName
      ),
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
      textures[symbol] = this.resolveTexture(atlas, textureName);
    });

    return textures;
  }

  private resolveTexture(atlas: Spritesheet, textureName: string): Texture {
    const texture = atlas.textures[textureName];

    if (texture === undefined) {
      throw new Error(`Texture "${textureName}" was not loaded`);
    }

    return texture;
  }
}
