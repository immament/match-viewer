import {
  AnimationMixer,
  LoopOnce,
  Object3D,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PlayerId } from "../../PlayerId";
import { createMoveActions } from "../actions.factory";

vi.mock("three");
vi.mock(import("../../__sampleData__/awayPlayersPosition.big.mock"));
vi.mock(import("../../__sampleData__/homePlayersPosition.big.mock"));
vi.mock(import("../../__sampleData__/ball.mock"));
vi.mock(import("../../__sampleData__/playersPose.mock"));

describe("actions factory", () => {
  let _mixer: AnimationMixer;
  const _playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };

  beforeEach(() => {
    _mixer = new AnimationMixer({} as Object3D);
  });

  test("should create move actions", () => {
    const { positionAction, rotateAction, poses } = createMoveActions(
      _mixer,
      _playerId
    );

    expect(positionAction).toBeTruthy();
    expect(rotateAction).toBeTruthy();
    expect(poses).toBeTruthy();
  });

  test("should create position action with default values", () => {
    const { positionAction } = createMoveActions(_mixer, _playerId);

    expect(positionAction.loop).toBe(LoopOnce);
    expect(positionAction.clampWhenFinished).toBe(true);
  });

  test("should create position action with correct keyframes", () => {
    const { positionAction } = createMoveActions(_mixer, _playerId);

    const positionKF = positionAction
      .getClip()
      .tracks.find(
        (track) => track instanceof VectorKeyframeTrack
      ) as VectorKeyframeTrack;
    expect(positionKF).toBeTruthy();
    expect(positionKF.name).toBe(".position");
    expect(positionKF.times.length).greaterThan(0);
    expect(positionKF.values.length).greaterThan(0);
  });

  test("should create rotate action with correct keyframes", () => {
    const { rotateAction } = createMoveActions(_mixer, _playerId);

    const rotateKF = rotateAction
      .getClip()
      .tracks.find(
        (track) => track instanceof QuaternionKeyframeTrack
      ) as QuaternionKeyframeTrack;
    expect(rotateKF).toBeTruthy();
    expect(rotateKF.name).toBe(".quaternion");
    expect(rotateKF.times.length).greaterThan(0);
    expect(rotateKF.values.length).greaterThan(0);
  });
});
