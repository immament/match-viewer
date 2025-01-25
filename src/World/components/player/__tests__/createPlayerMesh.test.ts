import { AnimationClip, Object3D } from "three";
import { describe, expect, test, vi } from "vitest";
import { getPlayers as getAwayPlayers } from "../__sampleData__/awayPlayersPosition.big.mock";
import { getBallPositions } from "../__sampleData__/ball.mock";
import { getPlayers as getHomePlayers } from "../__sampleData__/homePlayersPosition.big.mock";
import { getAllPlayerPoses } from "../__sampleData__/playersPose.mock";
import { MatchPositions } from "../animations/positions.utils";
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
    const positionsConfig: MatchPositions = {
      ball: getBallPositions(),
      players: [getHomePlayers(), getAwayPlayers()],
      poses: getAllPlayerPoses()
    };
    const { player } = createPlayerMesh(
      _playerId,
      model3d,
      clips,
      modelConfig,
      positionsConfig
    );

    expect(player.actions).toBeTruthy();
    expect(player.model).toBe(model3d);
    expect(player.mixer).toBeTruthy();
    expect(player.poses).toBeTruthy();
    expect(player.teamIdx).toBe(_playerId.teamIdx);
    expect(player.playerIdx).toBe(_playerId.playerIdx);
  });
});
