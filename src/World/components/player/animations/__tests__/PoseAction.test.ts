import { AnimationClip, AnimationMixer, Object3D } from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { PoseTypes } from "../Pose.model";
import { PoseAction, PoseAnimationAction, PoseRecord } from "../PoseAction";

vi.mock("three");

describe("PoseAction", () => {
  let animationMock: PoseAnimationAction;
  beforeEach(() => {
    animationMock = new PoseAnimationAction(
      new AnimationMixer({} as Object3D),
      new AnimationClip()
    );
  });

  it("startAction with different pose type", () => {
    const poseAction = new PoseAction(animationMock, true, PoseTypes.head);
    const poseRecord = mock<PoseRecord>({ type: PoseTypes.idle });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeFalsy();
    expect(poseAction.animation.play).not.toBeCalled();
  });

  it("startAction with the same pose type", () => {
    const poseType = PoseTypes.head;
    const poseAction = new PoseAction(animationMock, true, poseType);
    const poseRecord = mock<PoseRecord>({ type: poseType });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeTruthy();
    expect(poseAction.animation.play).toBeCalled();
  });

  it("startAction", () => {
    const poseAction = new PoseAction(animationMock, true, PoseTypes.head);

    const expected = { startFrom: 0.5, timeScale: 0.9, weight: 1 };

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: expected.startFrom,
      timeScale: expected.timeScale
    });

    poseAction.startAction(poseRecord, false);

    expect(poseAction.animation.time).toEqual(expected.startFrom);
    expect(poseAction.animation.setEffectiveTimeScale).toBeCalledWith(
      expected.timeScale
    );
    expect(poseAction.animation.setEffectiveWeight).toBeCalledWith(
      expected.weight
    );
    expect(poseAction.animation.play).toBeCalled();
  });

  it("startAction reverse", () => {
    const poseAction = new PoseAction(animationMock, true, PoseTypes.head);

    const animationClipMock = new AnimationClip();
    const expected = { animationTime: 2, timeScale: 0.9, weight: 1 };

    animationClipMock.duration = expected.animationTime;

    vi.mocked(animationMock.getClip).mockReturnValue(animationClipMock);

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: 0.5,
      timeScale: expected.timeScale
    });

    poseAction.startAction(poseRecord, true);

    expect(animationMock.getClip).toHaveBeenCalled();
    expect(poseAction.animation.time).toEqual(expected.animationTime);
    expect(poseAction.animation.setEffectiveTimeScale).toBeCalledWith(
      expected.timeScale
    );
    expect(poseAction.animation.setEffectiveWeight).toBeCalledWith(
      expected.weight
    );
    expect(poseAction.animation.play).toHaveBeenCalledOnce();
  });

  it.todo("get state", () => {});
});
