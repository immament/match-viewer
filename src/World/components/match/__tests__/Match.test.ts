import { IViewController } from "src/World/IViewController";
import { AnimationClip, AnimationMixer, Object3D, Vector3 } from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlayerActions } from "../../player/animations/PlayerActions";
import { PoseRecord } from "../../player/animations/PoseAction.model";
import { Player3D, PlayerMesh } from "../../player/PlayerMesh";
import { Ball } from "../Ball";
import { Match } from "../Match.model";
import { createMatch } from "../matchFactory";

vi.mock("three");

vi.mock(import("../loadBall"), () => {
  return {
    loadBall: vi.fn(() => {
      const ball = new Ball();
      const mixer = new AnimationMixer(ball);
      const clip = new AnimationClip("ball-clip", 1);
      const action = mixer.clipAction(clip);
      ball.setMixer(mixer, action);
      return Promise.resolve({ ball });
    })
  };
});
vi.mock(import("../../player/loadPlayers"), () => ({
  loadPlayers: vi.fn().mockImplementation(() => {
    const playerObjects = [{} as Player3D, {} as Player3D];
    return Promise.resolve({
      players: playerObjects.map(
        (obj, index) =>
          new PlayerMesh(
            { teamIdx: 1, playerIdx: index },
            obj,
            new AnimationMixer(obj),
            {} as PlayerActions,
            [] as PoseRecord[]
          )
      )
    });
  })
}));

vi.mock(import("../../SceneDirector"), () => {
  return {
    SceneDirector: vi.fn().mockImplementation(() => ({
      duration: 90 * 60,
      time: 0,
      timeInMinutes: 0,
      timeScale: 1,
      addMixer: vi.fn(),
      gotoTime: vi.fn(),
      moveTime: vi.fn(),
      modifyTimeScale: vi.fn(),
      addEventListener: vi.fn()
    }))
  };
});

describe("Match", () => {
  let match: Match;
  let controls: IViewController;

  beforeEach(async () => {
    controls = {
      camera: new Object3D(),
      setCameraTarget: vi.fn()
    } as unknown as IViewController;
    match = await createMatch(controls);
  });

  it("should initialize with default values", () => {
    expect(Match.instance).toBe(match);
    expect(match.followBall).toBe(false);
  });

  it("should load ball and players", async () => {
    expect(match.ballPosition).toEqual(new Vector3(0, 0, 0));
    expect(match.getPlayerByIdx(0)).instanceOf(PlayerMesh);
  });

  it("should follow ball", () => {
    match.followBall = true;
    expect(controls.setCameraTarget).toHaveBeenCalledWith(match["_ball"]);
  });

  it("should follow player", async () => {
    const player = match.getPlayerByIdx(0);
    match.followPlayer(player);
    expect(controls.setCameraTarget).toHaveBeenCalledWith(player.model);
  });

  it("should add updatable", () => {
    const updatable = { tick: vi.fn() };
    match.addUpdatable(updatable);
    expect(match["_updatables"]).toContain(updatable);
  });

  it("should update updatables on tick", async () => {
    const updatable = { tick: vi.fn() };
    match.addUpdatable(updatable);
    match.tick(0.016);
    expect(updatable.tick).toHaveBeenCalled();
  });

  //   it("should handle mouse events", () => {
  //     const pointerSpy = vi.spyOn<any, any>(match, "pointer");
  //     const followClickSpy = vi.spyOn<any, any>(match, "followClick");
  //     window.dispatchEvent(
  //       new MouseEvent("mouseup", { clientX: 100, clientY: 100, button: 0 })
  //     );
  //     expect(pointerSpy).toHaveBeenCalled();
  //     window.dispatchEvent(
  //       new MouseEvent("mouseup", { clientX: 100, clientY: 100, button: 2 })
  //     );
  //     expect(followClickSpy).toHaveBeenCalled();
  //   });
});
