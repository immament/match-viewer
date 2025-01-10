import { Euler, Quaternion } from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { PlayerId } from "../../PlayerId";
import { BallPositionProxy } from "../BallPositionProxy";
import { PlayerPositionProxy } from "../PlayerPositionProxy";
import { PoseTypes, RawPoseEvents } from "../Pose.model";
import { PoseRecord } from "../PoseAction.model";
import { PoseBuilderStep } from "../PoseBuilderStep";
import { BallPositionsConfig } from "../positions.utils";

describe("PoseBuilderStep", () => {
  let playerPositions: Float32Array;
  let ballPositions: BallPositionsConfig;
  let times: ReadonlyArray<number>;
  let rawPoses: RawPoseEvents;
  let playerId: PlayerId;
  let playerPositionsProxy: PlayerPositionProxy;
  let ballPositionsProxy: BallPositionProxy;

  beforeEach(() => {
    playerPositions = new Float32Array([1, 2, 3, 4, 5, 6]);
    ballPositions = { px: [11, 14], pHeight: [12, 15], pz: [13, 16] };
    times = [101, 102];
    rawPoses = { 0: "l", 1: "r" };
    playerId = { teamIdx: 1, playerIdx: 2 };

    playerPositionsProxy = new PlayerPositionProxy(playerPositions, playerId);
    ballPositionsProxy = new BallPositionProxy(ballPositions, playerId);
  });

  describe("create", () => {
    it("should initialize with default values", () => {
      const builderStep = new PoseBuilderStep(
        playerPositionsProxy,
        ballPositionsProxy,
        times,
        rawPoses
      );

      expect(builderStep.stepIdx).toBe(0);
      expect(builderStep.time).toBe(101);
      expect(builderStep.rawPose).toBe("l");
      expect(builderStep.playerPos).toMatchObject({ x: 1, y: 2, z: 3 });
      expect(builderStep.ballPos).toMatchObject({ x: 11, y: 12, z: 13 });
      expect(builderStep.pose).toBeUndefined();
    });

    it("should throw error, if posesResult array has wrong size", () => {
      expect(
        () =>
          new PoseBuilderStep(
            playerPositionsProxy,
            ballPositionsProxy,
            times,
            rawPoses,
            [{} as PoseRecord]
          )
      ).toThrowError("Wrong array sizes posesResult.length !== times.length");
    });

    it("should throw error, if rotateValues array has wrong size", () => {
      expect(
        () =>
          new PoseBuilderStep(
            playerPositionsProxy,
            ballPositionsProxy,
            times,
            rawPoses,
            [{} as PoseRecord, {} as PoseRecord],
            [0, 1, 2, 3]
          )
      ).toThrowError(
        "Wrong array sizes directionsResult.length !== times.length*4"
      );
    });
  });

  it("should initialize pose record", () => {
    const builderStep = new PoseBuilderStep(
      playerPositionsProxy,
      ballPositionsProxy,
      times,
      rawPoses
    );

    const playerSpeed = 1;
    const poseRecord = builderStep.initPoseRecord(playerSpeed);

    expect(poseRecord).toEqual({
      type: PoseTypes.idle,
      step: 0,
      timeScale: 1,
      playerSpeed,
      iteration: 0,
      rawPose: rawPoses[0],
      direction: 0,
      rotation: 0
    });

    expect(builderStep.pose).toBe(poseRecord);
  });

  it("should change step index", () => {
    const builderStep = new PoseBuilderStep(
      playerPositionsProxy,
      ballPositionsProxy,
      times,
      rawPoses
    );

    builderStep.stepIdx = 1;

    expect(builderStep.stepIdx).toBe(1);
    expect(builderStep.time).toBe(102);
    expect(builderStep.rawPose).toBe("r");
    expect(builderStep.playerPos).toMatchObject({ x: 4, y: 5, z: 6 });
    expect(builderStep.ballPos).toMatchObject({ x: 14, y: 15, z: 16 });
    expect(builderStep.pose).toBeUndefined();
  });

  it("should initialize pose record for new step index", () => {
    const builderStep = new PoseBuilderStep(
      playerPositionsProxy,
      ballPositionsProxy,
      times,
      rawPoses
    );

    const stepIdx = 1;

    builderStep.stepIdx = stepIdx;

    const playerSpeed = 1;
    const poseRecord = builderStep.initPoseRecord(playerSpeed);

    expect(poseRecord).toEqual({
      type: PoseTypes.idle,
      step: stepIdx,
      timeScale: 1,
      playerSpeed,
      iteration: 0,
      rawPose: rawPoses[stepIdx],
      direction: 0,
      rotation: 0
    });

    expect(builderStep.pose).toBe(poseRecord);
  });

  it("should save player direction", () => {
    const rotateValues = Array(times.length * 4);
    const direction = Math.PI / 4;

    const builderStep = new PoseBuilderStep(
      playerPositionsProxy,
      ballPositionsProxy,
      times,
      rawPoses,
      [{} as PoseRecord, {} as PoseRecord],
      rotateValues
    );
    builderStep.savePlayerDirection(direction);

    const savedQuaternion = new Quaternion().fromArray(rotateValues, 0);

    const savedEuler = new Euler().setFromQuaternion(savedQuaternion, "XYZ");
    expect(savedEuler.y).toBeCloseTo(direction);
  });
});
