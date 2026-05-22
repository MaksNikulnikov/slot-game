import type { SpinResult } from "../slot/SpinResult";

export type SpinResponse = SpinResult;

export type SpinServer = {
  spin(): Promise<SpinResponse>;
};
