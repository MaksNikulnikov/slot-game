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
      symbols: ["cherry", "lemon", "seven"]
    });

    vi.useRealTimers();
  });
});
