import { describe, expect, it } from "vitest";

import type { SpinServer } from "../server/SpinServer";
import { SlotMachine } from "./SlotMachine";

describe("SlotMachine", () => {
  it("returns the server symbols with the evaluated outcome", async () => {
    const server: SpinServer = {
      spin: async () => ({
        symbols: ["lemon", "lemon", "lemon"]
      })
    };
    const machine = new SlotMachine(server);

    await expect(machine.spin()).resolves.toEqual({
      symbols: ["lemon", "lemon", "lemon"],
      isWin: true
    });
  });
});
