import type { SpinResult } from "../slot/SpinResult";
import type { SlotMatrix } from "../slot/Symbol";

export type SlotGamePhase =
  | "idle"
  | "spinning"
  | "settling"
  | "completed"
  | "failed";

export type SlotGameState = {
  phase: SlotGamePhase;
  matrix: SlotMatrix;
  result: SpinResult | null;
  errorMessage: string | null;
};

export type SlotGameEvent =
  | { type: "spinRequested" }
  | { type: "spinReceived"; result: SpinResult }
  | { type: "settleFinished" }
  | { type: "spinFailed"; message: string };

export class SlotGameStateMachine {
  private currentState: SlotGameState;

  public constructor(initialMatrix: SlotMatrix) {
    this.currentState = createInitialSlotGameState(initialMatrix);
  }

  public get state(): SlotGameState {
    return this.currentState;
  }

  public get canSpin(): boolean {
    return canRequestSpin(this.currentState);
  }

  public dispatch(event: SlotGameEvent): SlotGameState {
    this.currentState = reduceSlotGameState(this.currentState, event);

    return this.currentState;
  }
}

export function createInitialSlotGameState(
  initialMatrix: SlotMatrix
): SlotGameState {
  return {
    phase: "idle",
    matrix: initialMatrix,
    result: null,
    errorMessage: null
  };
}

export function reduceSlotGameState(
  state: SlotGameState,
  event: SlotGameEvent
): SlotGameState {
  switch (event.type) {
    case "spinRequested":
      if (!canRequestSpin(state)) {
        return state;
      }

      return {
        ...state,
        phase: "spinning",
        result: null,
        errorMessage: null
      };

    case "spinReceived":
      if (state.phase !== "spinning") {
        return state;
      }

      return {
        ...state,
        phase: "settling",
        result: event.result,
        errorMessage: null
      };

    case "settleFinished":
      if (state.phase !== "settling" || state.result === null) {
        return state;
      }

      return {
        ...state,
        phase: "completed",
        matrix: state.result.matrix
      };

    case "spinFailed":
      if (state.phase !== "spinning" && state.phase !== "settling") {
        return state;
      }

      return {
        ...state,
        phase: "failed",
        result: null,
        errorMessage: event.message
      };
  }
}

export function canRequestSpin(state: SlotGameState): boolean {
  return (
    state.phase === "idle" ||
    state.phase === "completed" ||
    state.phase === "failed"
  );
}
