import "@esotericsoftware/spine-pixi-v8";

import { Assets } from "pixi.js";
import type { Texture } from "pixi.js";

import type { GameAssets } from "./gameAssets";

export type AssetProgressHandler = (progress: number) => void;

export type LoadedGameAssets = {
  backgroundTexture: Texture;
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
        onProgress(progress * 0.4);
      }
    );

    await Assets.load(
      [spineCharacter.skeletonAlias, spineCharacter.atlasAlias],
      (progress) => {
        onProgress(0.4 + progress * 0.6);
      }
    );

    onProgress(1);

    return {
      backgroundTexture,
      spineCharacter: {
        atlasAlias: spineCharacter.atlasAlias,
        skeletonAlias: spineCharacter.skeletonAlias
      }
    };
  }

  private resolvePath(path: string): string {
    return `${this.options.baseUrl}${path}`;
  }
}
