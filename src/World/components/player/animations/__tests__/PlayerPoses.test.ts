import { AnimationClip, AnimationMixer, Object3D } from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { PlayerId } from "../../PlayerId";
import { PlayerPoses, PoseChangedEventDetail } from "../PlayerPoses";
import { PoseTypes } from "../Pose.model";
import { PoseRecord } from "../PoseAction.model";
import { PoseAnimationAction } from "../PoseAnimationAction";

vi.mock(import("three"));

const PlayerActions = vi.fn();

describe("PlayerPoses", () => {
  const defaultPlayerId: Readonly<PlayerId> = { teamIdx: 1, playerIdx: 2 };
  let playerPoses: PlayerPoses;

  describe("simple properties", () => {
    beforeEach(() => {
      playerPoses = new PlayerPoses(
        defaultPlayerId,
        new AnimationMixer({} as Object3D),
        new PlayerActions(),
        []
      );
    });

    it("syncCrossFade", () => {
      playerPoses.syncCrossFade = true;
      expect(playerPoses.syncCrossFade).toBe(true);
      playerPoses.syncCrossFade = false;
      expect(playerPoses.syncCrossFade).toBe(false);
    });

    it("pause", () => {
      playerPoses.pause = true;
      expect(playerPoses.pause).toBe(true);
      playerPoses.pause = false;
      expect(playerPoses.pause).toBe(false);
    });

    it("playerId", () => {
      expect(playerPoses.playerId).toEqual({ ...defaultPlayerId });
    });

    it("default currentPose is undefined", () => {
      expect(playerPoses.currentPose).toBeUndefined();
    });

    it("change current pose", async () => {
      const action = createPoseAction();

      const poseRecord: PoseRecord = {
        type: PoseTypes.tPose,
        timeScale: 0,
        playerSpeed: 0,
        step: 0,
        direction: 0,
        rotation: 0,
        action
      };
      const poseChange = new Promise((done) => {
        playerPoses.addEventListener("poseChanged", (ev) => {
          const pcEv = ev as CustomEvent<PoseChangedEventDetail>;
          done(pcEv.detail);
        });
      });
      playerPoses.setCurrentPose(poseRecord);

      const result = playerPoses.currentPose;

      expect(result).toEqual({ ...poseRecord });
      // expect(result?.action?.poseRecord).toEqual({ ...poseRecord });

      await expect(poseChange, "pose change event emitted").resolves.toEqual({
        player: defaultPlayerId,
        pose: poseRecord
      });
    });
  });

  describe("switch", () => {
    it.each([{ withSync: true }])(
      "switchPoseTo(, $withSync)",
      ({ withSync }) => {
        const playerActions = new PlayerActions();
        playerActions.state = () => {
          return {};
        };
        playerPoses = new PlayerPoses(
          defaultPlayerId,
          new AnimationMixer({} as Object3D),
          playerActions,
          []
        );
        //playerActions.getPoseAction = () => new PoseAction();

        // poseAction.state = () => ({} as ReturnType<PoseAction["state"]>);
        const poseActionMock = mock<PoseAnimationAction>();
        const poseRecord = mock<PoseRecord>({
          type: PoseTypes.head,
          action: poseActionMock
        });

        playerPoses.switchPoseTo(poseRecord, withSync);

        expect(playerPoses.currentPose).toBe(poseRecord);
        expect(playerPoses.currentPose?.type).toBe(PoseTypes.head);
      }
    );
  });
});
function createPoseAction(): PoseAnimationAction {
  return new PoseAnimationAction(
    true,
    PoseTypes.head,
    { teamIdx: 1, playerIdx: 2 },
    new AnimationMixer({} as Object3D),
    new AnimationClip()
  );
}
