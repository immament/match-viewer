import { AnimationClip, AnimationMixer, Object3D } from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { PlayerId } from "../../PlayerId";
import { PoseTypes } from "../Pose.model";
import { PoseRecord } from "../PoseAction.model";
import { PoseAnimationAction } from "../PoseAnimationAction";

vi.mock("three");
// type ThreeModule = typeof import("three");
// const threeMock = await vi.hoisted(() => vi.importMock<ThreeModule>("three"));

// vi.mock("three", async (importOriginal) => {
//   const mod = await importOriginal<ThreeModule>();
//   return {
//     ...threeMock,
//     AnimationAction: mod.AnimationAction,
//     AnimationClip: vi.fn((name, duration) => ({
//       name,
//       tracks: [],
//       duration: duration ?? 2
//     }))
//   };
// });

describe("PoseAnimationAction", () => {
  // let animationMock: PoseAnimationAction;
  let playerId: PlayerId;
  beforeEach(() => {
    playerId = { teamIdx: 1, playerIdx: 2 };
    // animationMock = new PoseAnimationAction(
    //   new AnimationMixer({} as Object3D),
    //   new AnimationClip()
    // );
  });

  test("startAction with different pose type", () => {
    const poseAction = new PoseAnimationAction(
      true,
      PoseTypes.head,
      playerId,
      new AnimationMixer({} as Object3D),
      new AnimationClip("mock", 1, [])
    );
    const poseRecord = mock<PoseRecord>({ type: PoseTypes.idle });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeFalsy();
  });

  test("startAction with the same pose type", () => {
    const poseType = PoseTypes.head;
    const poseAction = new PoseAnimationAction(
      true,
      poseType,
      playerId,
      new AnimationMixer({} as Object3D),
      new AnimationClip()
    );
    const poseRecord = mock<PoseRecord>({ type: poseType });

    const result = poseAction.startAction(poseRecord);

    expect(result).toBeTruthy();
  });

  test("startAction forward", () => {
    const poseAction = new PoseAnimationAction(
      true,
      PoseTypes.head,
      playerId,
      new AnimationMixer({} as Object3D),
      new AnimationClip()
    );

    const expected = { time: 0.5, timeScale: 0.9, weight: 1 };

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: expected.time,
      timeScale: expected.timeScale
    });

    poseAction.startAction(poseRecord, false);

    expect(poseAction).toMatchObject(expected);
    // expect(poseAction.setEffectiveTimeScale).toBeCalledWith(expected.timeScale);
    // expect(poseAction.setEffectiveWeight).toBeCalledWith(expected.weight);
    // expect(poseAction.play).toBeCalled();
  });

  test("startAction reverse", () => {
    const expected = { animationTime: 2, timeScale: 0.9, weight: 1 };

    const animationClip = new AnimationClip(undefined, expected.animationTime);

    const poseAction = new PoseAnimationAction(
      true,
      PoseTypes.head,
      playerId,
      new AnimationMixer({} as Object3D),
      animationClip
    );

    // vi.mocked(animationMock.getClip).mockReturnValue(animationClipMock);

    const poseRecord = mock<PoseRecord>({
      type: PoseTypes.head,
      startFrom: 0.5,
      timeScale: expected.timeScale
    });

    poseAction.startAction(poseRecord, true);

    expect(poseAction).toMatchObject({
      time: expected.animationTime,
      weight: expected.weight,
      timeScale: expected.timeScale
    });
  });
});
