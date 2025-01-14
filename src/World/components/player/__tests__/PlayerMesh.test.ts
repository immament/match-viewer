import { AnimationMixer, Object3D } from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PlayerId } from "../PlayerId";
import { PlayerMesh } from "../PlayerMesh";
import { PlayerActions } from "../animations/PlayerActions";
import { PoseRecord } from "../animations/PoseAction.model";

vi.mock("three");

const PlayerActionsMock = vi.fn();

describe("PlayerMesh", () => {
  let playerId: PlayerId;
  let model: Object3D;
  let mixer: AnimationMixer;
  let actions: PlayerActions;
  let poses: PoseRecord[];

  beforeEach(() => {
    playerId = { teamIdx: 1, playerIdx: 2 };
    model = new Object3D();
    mixer = new AnimationMixer(model);
    actions = new PlayerActionsMock();
    poses = [];
  });

  test("should initialize with default values", () => {
    const playerMesh = new PlayerMesh(playerId, model, mixer, actions, poses);

    expect(playerMesh.model).toBe(model);
    expect(playerMesh.poses).toBeTruthy();
    expect(playerMesh.actions).toBe(actions);
    expect(playerMesh.mixer).toBe(mixer);
    expect(playerMesh.playerIdx).toBe(playerId.playerIdx);
    expect(playerMesh.teamIdx).toBe(playerId.teamIdx);

    expect(playerMesh.add).toHaveBeenCalledWith(model);
  });

  test("isPlayer returns true for matching player ID", () => {
    const playerMesh = new PlayerMesh(playerId, model, mixer, actions, poses);

    expect(playerMesh.isPlayer({ teamIdx: 1, playerIdx: 2 })).toBe(true);
  });

  test("isPlayer returns false for non-matching player ID", () => {
    const playerMesh = new PlayerMesh(playerId, model, mixer, actions, poses);

    expect(playerMesh.isPlayer({ teamIdx: 1, playerIdx: 3 })).toBe(false);
  });

  test("tick should update mixer & pose", () => {
    const deltaTime = 10;
    const playerMesh = new PlayerMesh(playerId, model, mixer, actions, poses);

    vi.spyOn(playerMesh.poses, "updatePose");
    playerMesh.tick(deltaTime);

    expect(mixer.update).toHaveBeenCalledWith(deltaTime);
    expect(playerMesh.poses.updatePose).toHaveBeenCalledWith(deltaTime);
  });

  describe("only debug", () => {
    test("should modify delta time in single step mode", () => {
      const deltaTime = 10;
      const stepDeltaTime = 20;
      const playerMesh = new PlayerMesh(playerId, model, mixer, actions, poses);
      playerMesh.debug_singleStepMode = true;
      playerMesh.debug_sizeOfNextStep = stepDeltaTime;
      playerMesh.tick(deltaTime);

      expect(mixer.update).toHaveBeenCalledWith(stepDeltaTime);
      expect(playerMesh.debug_sizeOfNextStep).toBe(0);
    });
  });
});
