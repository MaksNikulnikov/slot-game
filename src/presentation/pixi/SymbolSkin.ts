import type { SlotSymbol } from "../../core/slot/Symbol";

export type SymbolSkin = {
  label: string;
  fill: number;
  stroke: number;
};

export const symbolSkins: Record<SlotSymbol, SymbolSkin> = {
  cherry: {
    label: "CH",
    fill: 0xc83248,
    stroke: 0xff8795
  },
  lemon: {
    label: "LE",
    fill: 0xf5c84c,
    stroke: 0xffef9e
  },
  seven: {
    label: "7",
    fill: 0x3d8bd9,
    stroke: 0x91c7ff
  }
};
