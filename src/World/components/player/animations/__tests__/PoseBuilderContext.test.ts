import { beforeEach, describe, expect, it } from "vitest";
import { PlayerId } from "../../PlayerId";
import { RawPoseEvents } from "../Pose.model";
import { PoseBuilderContext } from "../PoseBuilderContext";
import { BallPositionsConfig } from "../positions.utils";

describe("PoseBuilderContext", () => {
  let playerPositions: Float32Array;
  let ballPositions: BallPositionsConfig;
  let times: ReadonlyArray<number>;
  let rawPoses: RawPoseEvents;
  let playerId: PlayerId;

  beforeEach(() => {
    playerPositions = new Float32Array([0, 0, 0, 1, 0, 1]);
    ballPositions = { px: [1, 4], pz: [3, 5], pHeight: [2, 6] };
    times = [0, 1];
    rawPoses = ["l", "p"];
    playerId = { teamIdx: 1, playerIdx: 2 };
  });

  it("should initialize with default values", () => {
    const context = new PoseBuilderContext(
      playerId,
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    expect(context.getPosesResult()).length(times.length);
    expect(context.getDirectionsResult()).length(times.length * 4);
  });

  describe("change step index", () => {
    let context: PoseBuilderContext;
    beforeEach(() => {
      context = new PoseBuilderContext(
        playerId,
        playerPositions,
        ballPositions,
        times,
        rawPoses
      );
    });
    it.each([0, 5, 7, 8])(
      "should set step index to %1 and change prev & next",
      (index) => {
        context.stepIdx = index;
        expect(context.stepIdx).toBe(index);
        expect(context.prev.stepIdx).toBe(index - 1);
        expect(context.next.stepIdx).toBe(index + 1);
      }
    );
  });

  it("should get poses result", () => {
    const context = new PoseBuilderContext(
      playerId,
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    context.stepIdx = 1;
    const posesResult = context.getPosesResult();

    expect(posesResult.length).toBe(times.length);
  });

  it("should get directions result", () => {
    const context = new PoseBuilderContext(
      playerId,
      playerPositions,
      ballPositions,
      times,
      rawPoses
    );
    context.stepIdx = 1;
    const directionsResult = context.getDirectionsResult();
    expect(directionsResult.length).toBe(times.length * 4);
    // expect(rotationResult).toBe(times);
  });
});
