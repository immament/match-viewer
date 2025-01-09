import {
  AnimationMixer,
  Object3D,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlayerId } from "../../PlayerId";
import { createMoveActions } from "../actions.factory";

vi.mock("three");

describe.skip("actions factory", () => {
  let mixer: AnimationMixer;
  let playerId: PlayerId;

  beforeEach(() => {
    mixer = new AnimationMixer({} as Object3D);
    playerId = { teamIdx: 0, playerIdx: 1 };
  });

  it("should create move actions", () => {
    const playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };

    const { positionAction, rotateAction, poses } = createMoveActions(
      mixer,
      playerId
    );

    expect(positionAction).toBeTruthy();
    expect(rotateAction).toBeTruthy();
    expect(poses).toBeTruthy();
  });

  it("should create position action with correct keyframes", () => {
    const { positionAction } = createMoveActions(mixer, playerId);

    const positionKF = positionAction
      .getClip()
      .tracks.find(
        (track) => track instanceof VectorKeyframeTrack
      ) as VectorKeyframeTrack;
    expect(positionKF).toBeTruthy();
    expect(positionKF.name).toBe(".position");
  });

  it("should create rotate action with correct keyframes", () => {
    const { rotateAction } = createMoveActions(mixer, playerId);

    const rotateKF = rotateAction
      .getClip()
      .tracks.find(
        (track) => track instanceof QuaternionKeyframeTrack
      ) as QuaternionKeyframeTrack;
    expect(rotateKF).toBeTruthy();
    expect(rotateKF.name).toBe(".quaternion");
  });
});
