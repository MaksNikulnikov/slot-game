import type { SlotSymbol } from "../../core/slot/Symbol";

export type GameAssets = {
  backgroundPath: string;
  slotMachineAtlasPath: string;
  slotSymbolAtlasPath: string;
  slotReelsFrameTextureName: string;
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
  slotMachineAtlasPath: "assets/atlases/slot-machine.json",
  slotSymbolAtlasPath: "assets/atlases/slot-symbols.json",
  slotReelsFrameTextureName: "slot.reelsFrame",
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
