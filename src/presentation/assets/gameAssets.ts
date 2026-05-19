import type { SlotSymbol } from "../../core/slot/Symbol";

export type GameAssets = {
  backgroundPath: string;
  slotSymbolAtlasPath: string;
  slotSymbolTextureNames: Record<SlotSymbol, string>;
  spineCharacter: {
    atlasPath: string;
    atlasAlias: string;
    skeletonPath: string;
    skeletonAlias: string;
  };
};

export const gameAssets: GameAssets = {
  backgroundPath: "assets/background.svg",
  slotSymbolAtlasPath: "assets/atlases/slot-symbols.json",
  slotSymbolTextureNames: {
    cherry: "slot.cherry",
    lemon: "slot.lemon",
    seven: "slot.seven"
  },
  spineCharacter: {
    atlasPath: "assets/spine/spineboy-pma.atlas",
    atlasAlias: "spineboyAtlas",
    skeletonPath: "assets/spine/spineboy-pro.skel",
    skeletonAlias: "spineboySkeleton"
  }
};
