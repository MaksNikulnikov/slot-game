import type { SlotSymbols } from "../slot/Symbol";

export type SpinResponse = {
  symbols: SlotSymbols;
};

export type SpinServer = {
  spin(): Promise<SpinResponse>;
};
