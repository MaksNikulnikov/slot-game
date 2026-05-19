export type GameAssets = {
  backgroundPath: string;
  spineCharacter: {
    atlasPath: string;
    atlasAlias: string;
    skeletonPath: string;
    skeletonAlias: string;
  };
};

export const gameAssets: GameAssets = {
  backgroundPath: "assets/background.svg",
  spineCharacter: {
    atlasPath: "assets/spine/spineboy-pma.atlas",
    atlasAlias: "spineboyAtlas",
    skeletonPath: "assets/spine/spineboy-pro.skel",
    skeletonAlias: "spineboySkeleton"
  }
};
