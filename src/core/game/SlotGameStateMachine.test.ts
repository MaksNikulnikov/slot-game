import { describe, expect, it } from "vitest";

import type { SpinResult } from "../slot/SpinResult";
import type { SlotMatrix } from "../slot/Symbol";
import { SlotGameStateMachine } from "./SlotGameStateMachine";
import { canRequestSpin } from "./SlotGameStateMachine";

const initialMatrix: SlotMatrix = [["cherry", "lemon", "seven"]];

const winningResult: SpinResult = {
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
};

describe("SlotGameStateMachine", () => {
  it("starts idle with the initial matrix", () => {
    const machine = new SlotGameStateMachine(initialMatrix);

    expect(machine.state).toEqual({
      phase: "idle",
      matrix: initialMatrix,
      result: null,
      errorMessage: null
    });
    expect(machine.canSpin).toBe(true);
  });

  it("runs a spin through request, settle, and completion", () => {
    const machine = new SlotGameStateMachine(initialMatrix);

    machine.dispatch({ type: "spinRequested" });
    expect(machine.state.phase).toBe("spinning");
    expect(machine.canSpin).toBe(false);

    machine.dispatch({ type: "spinReceived", result: winningResult });
    expect(machine.state).toEqual({
      phase: "settling",
      matrix: initialMatrix,
      result: winningResult,
      errorMessage: null
    });

    machine.dispatch({ type: "settleFinished" });
    expect(machine.state).toEqual({
      phase: "completed",
      matrix: winningResult.matrix,
      result: winningResult,
      errorMessage: null
    });
    expect(machine.canSpin).toBe(true);
  });

  it("ignores duplicate spin requests while a spin is active", () => {
    const machine = new SlotGameStateMachine(initialMatrix);

    const spinningState = machine.dispatch({ type: "spinRequested" });
    const nextState = machine.dispatch({ type: "spinRequested" });

    expect(nextState).toBe(spinningState);
  });

  it("starts the next spin directly from the completed result", () => {
    const machine = new SlotGameStateMachine(initialMatrix);

    machine.dispatch({ type: "spinRequested" });
    machine.dispatch({ type: "spinReceived", result: winningResult });
    machine.dispatch({ type: "settleFinished" });
    machine.dispatch({ type: "spinRequested" });

    expect(machine.state).toEqual({
      phase: "spinning",
      matrix: winningResult.matrix,
      result: null,
      errorMessage: null
    });
  });

  it("captures failed spin attempts", () => {
    const machine = new SlotGameStateMachine(initialMatrix);

    machine.dispatch({ type: "spinRequested" });
    machine.dispatch({ type: "spinFailed", message: "server unavailable" });

    expect(machine.state).toEqual({
      phase: "failed",
      matrix: initialMatrix,
      result: null,
      errorMessage: "server unavailable"
    });
    expect(canRequestSpin(machine.state)).toBe(true);
  });
});
