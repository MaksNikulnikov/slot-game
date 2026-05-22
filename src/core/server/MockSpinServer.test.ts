import { describe, expect, it, vi } from "vitest";

import { MockSpinServer } from "./MockSpinServer";

describe("MockSpinServer", () => {
  it("creates a deterministic response from the injected random source", async () => {
    vi.useFakeTimers();

    const randomValues = [0.1, 0.45, 0.9];
    const server = new MockSpinServer(() => randomValues.shift() as number);
    const responsePromise = server.spin();

    await vi.advanceTimersByTimeAsync(350);

    await expect(responsePromise).resolves.toEqual({
      matrix: [["cherry", "lemon", "seven"]],
      winningLines: [],
      isWin: false
    });

    vi.useRealTimers();
  });

  it("includes server-owned winning information", async () => {
    vi.useFakeTimers();

    const server = new MockSpinServer(() => 0.9);
    const responsePromise = server.spin();

    await vi.advanceTimersByTimeAsync(350);

    await expect(responsePromise).resolves.toEqual({
      matrix: [["seven", "seven", "seven"]],
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

    vi.useRealTimers();
  });
});
