import { Assets } from "pixi.js";
import type { Texture } from "pixi.js";

import type { GameAssets } from "./gameAssets";

export type AssetProgressHandler = (progress: number) => void;

export type LoadedGameAssets = {
  backgroundTexture: Texture;
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
    const backgroundTexture = await Assets.load<Texture>(
      this.resolvePath(this.options.assets.backgroundPath),
      onProgress
    );

    onProgress(1);

    return {
      backgroundTexture
    };
  }

  private resolvePath(path: string): string {
    return `${this.options.baseUrl}${path}`;
  }
}
