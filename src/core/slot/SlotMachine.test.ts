import { describe, expect, it } from "vitest";

import type { SpinServer } from "../server/SpinServer";
import { SlotMachine } from "./SlotMachine";

describe("SlotMachine", () => {
  it("returns the server result without evaluating the outcome locally", async () => {
    const server: SpinServer = {
      spin: async () => ({
        matrix: [["lemon", "cherry", "lemon"]],
        winningLines: [
          {
            cells: [
              { row: 0, column: 0 },
              { row: 0, column: 1 },
              { row: 0, column: 2 }
            ]
          }
        ],
        isWin: true
      })
    };
    const machine = new SlotMachine(server);

    await expect(machine.spin()).resolves.toEqual({
      matrix: [["lemon", "cherry", "lemon"]],
      winningLines: [
        {
          cells: [
            { row: 0, column: 0 },
            { row: 0, column: 1 },
            { row: 0, column: 2 }
          ]
        }
      ],
      isWin: true
    });
  });
});
