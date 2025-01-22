import { Mesh, Object3D } from "three";
import { describe, expect, it, vi } from "vitest";
import { loadPlayers } from "../loadPlayers";
import { logger } from "/app/logger";

logger.setLevel("SILENT");

// Mock dependencies
vi.mock(import("three"));
vi.mock(import("three/examples/jsm/loaders/GLTFLoader.js"));

vi.mock(import("../__sampleData__/awayPlayersPosition.big.mock"));
vi.mock(import("../__sampleData__/homePlayersPosition.big.mock"));
vi.mock(import("../__sampleData__/ball.mock"));
vi.mock(import("../__sampleData__/playersPose.mock"));

vi.spyOn(Object3D.prototype, "getObjectByName").mockImplementation((name) => {
  const result = new Mesh();
  result.add(new Mesh());
  result.name = name;
  return result;
});

describe("loadPlayers", () => {
  it("should load players correctly", async () => {
    const { players } = await loadPlayers();
    expect(players).toHaveLength(22);
    // console.log("players[0].userData", players[0]);
    expect(players[0].teamIdx).toBe(0);
    expect(players[0].playerIdx).toBe(0);
    expect(players[11].teamIdx).toBe(1);
    expect(players[21].playerIdx).toBe(10);
  });

  //   i t("should log an error if model loading fails", async () => {
  //     const error = new Error("Failed to load model");
  //     vi.mocked(GLTFLoader.prototype.loadAsync).mockRejectedValueOnce(error);

  //     await expect(loadPlayers()).rejects.toThrow(error);
  //     expect(logger.error).toHaveBeenCalledWith(
  //       "Exception during model loading: assets/models/player/player.gltf",
  //       error
  //     );
  //   });
});
