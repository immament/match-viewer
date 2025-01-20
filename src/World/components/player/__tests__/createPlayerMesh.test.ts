import { AnimationClip, Object3D } from "three";
import { describe, expect, test, vi } from "vitest";
import { createPlayerMesh } from "../createPlayerMesh";
import { ModelConfig } from "../ModelConfig";
import { PlayerId } from "../PlayerId";

vi.mock("three");
vi.mock(import("../__sampleData__/awayPlayersPosition.big.mock"));
vi.mock(import("../__sampleData__/homePlayersPosition.big.mock"));
vi.mock(import("../__sampleData__/ball.mock"));
vi.mock(import("../__sampleData__/playersPose.mock"));

describe("createPlayerMesh", () => {
  const _playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };

  test("should create a PlayerMesh instance", () => {
    const model3d = new Object3D();
    const clips: AnimationClip[] = [];
    const getMeshFn = vi.fn();
    const modelConfig = new ModelConfig("path", getMeshFn);
    const { player } = createPlayerMesh(_playerId, model3d, clips, modelConfig);

    expect(player.actions).toBeTruthy();
    expect(player.model).toBe(model3d);
    expect(player.mixer).toBeTruthy();
    expect(player.poses).toBeTruthy();
    expect(player.teamIdx).toBe(_playerId.teamIdx);
    expect(player.playerIdx).toBe(_playerId.playerIdx);
  });
});
