export const slotSymbols = ["cherry", "lemon", "seven"] as const;

export type SlotSymbol = (typeof slotSymbols)[number];

export type SlotSymbols = readonly [SlotSymbol, SlotSymbol, SlotSymbol];
