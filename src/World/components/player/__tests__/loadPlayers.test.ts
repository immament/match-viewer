import { describe, expect, it, vi } from "vitest";
import { loadPlayers } from "../loadPlayers";
import { logger } from "/app/logger";

logger.disableAll();

// Mock dependencies

vi.mock(import("../__sampleData__/awayPlayersPosition.big.mock"));
vi.mock(import("../__sampleData__/homePlayersPosition.big.mock"));
vi.mock(import("../__sampleData__/ball.mock"));
vi.mock(import("../__sampleData__/playersPose.mock"));

const MeshMock = vi.fn((name) => {
  return {
    name,
    animations: [],
    children: [],
    get scene() {
      return new MeshMock("scene");
    },
    getObjectByName: vi.fn((name) => new MeshMock(name)),
    material: {
      clone: vi.fn().mockReturnValue({ color: { set: vi.fn() } })
    },
    traverse: vi.fn(),
    clone: vi.fn(() => new MeshMock(name + " clone"))
  };
});

vi.mock("three");

// vi.mock("three/examples/jsm/utils/SkeletonUtils.js", () => {
//   return {
//     clone: (obj: Object3D) => {
//       return obj.clone();
//     }
//   };
// });
vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: vi.fn(() => ({
    loadAsync: vi.fn().mockResolvedValue(new MeshMock("main"))
  }))
}));

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
