import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D
} from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { PlayerId } from "../../PlayerId";
import { PoseTypes } from "../Pose.model";
import { PoseRecord } from "../PoseAction.model";
import { PoseAction2 } from "../PoseAction2";

vi.mock("three");

describe("PoseAction2", () => {
  let playerId: PlayerId;

  beforeEach(() => {
    playerId = { teamIdx: 1, playerIdx: 2 };
  });

  it("startAction with different pose type", () => {
    const poseAction = new PoseAction2(
      true,
      PoseTypes.head,
      playerId,
      createAnimationMock()
    );
    const poseRecord = mock<PoseRecord>({ type: PoseTypes.idle });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeFalsy();
  });

  it("startAction with the same pose type", () => {
    const poseType = PoseTypes.head;
    const poseAction = new PoseAction2(
      true,
      poseType,
      playerId,
      createAnimationMock()
    );
    const poseRecord = mock<PoseRecord>({ type: poseType });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeTruthy();
  });

  it("startAction forward", () => {
    const expected = { time: 0.5, timeScale: 0.9, weight: 1 };

    const animationMock = createAnimationMock();

    const poseAction = new PoseAction2(
      true,
      PoseTypes.head,
      playerId,
      animationMock
    );

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: expected.time,
      timeScale: expected.timeScale
    });

    poseAction.startAction(poseRecord, false);

    expect(poseAction.time).toBe(expected.time);
    expect(animationMock.setEffectiveTimeScale).toBeCalledWith(
      expected.timeScale
    );
    expect(animationMock.setEffectiveWeight).toBeCalledWith(expected.weight);
    expect(animationMock.play).toBeCalled();
  });

  it("startAction reverse", () => {
    const expected = { animationTime: 2, timeScale: 0.9, weight: 1 };

    // const animationClip = new AnimationClip(undefined, expected.animationTime);
    //vi.mocked(animationClip).duration = expected.animationTime;

    const AnimationClipMock = vi.fn(function (this: AnimationClip, duration) {
      this.duration = duration;
    });
    const animationClip = new AnimationClipMock(
      expected.animationTime
    ) as unknown as AnimationClip;
    const animationMock = vi.mocked(createAnimationMock(animationClip));
    animationMock.getClip.mockReturnValue(animationClip);

    const poseAction = new PoseAction2(
      true,
      PoseTypes.head,
      playerId,
      animationMock
    );

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: 0.5,
      timeScale: expected.timeScale
    });

    poseAction.startAction(poseRecord, true);

    expect(poseAction.time).toBe(expected.animationTime);
    expect(animationMock.setEffectiveTimeScale).toBeCalledWith(
      expected.timeScale
    );
    expect(animationMock.setEffectiveWeight).toBeCalledWith(expected.weight);
    expect(animationMock.play).toBeCalled();
  });
});

function createAnimationMock(clip?: AnimationClip) {
  return new AnimationAction(
    new AnimationMixer({} as Object3D),
    clip ?? new AnimationClip()
  );
}
