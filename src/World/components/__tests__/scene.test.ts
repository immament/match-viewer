import { Sky } from "three/examples/jsm/objects/Sky.js";
import { describe, expect, test, vi } from "vitest";
import { createScene, createStadium } from "../scene";

vi.mock("three");
vi.mock("three/examples/jsm/loaders/GLTFLoader.js");

describe("scene", () => {
  test("should create scene", () => {
    const scene = createScene();

    expect(scene).toBeTruthy();
    expect(vi.mocked(scene.add).mock.calls[0][0]).instanceOf(Sky);
  });

  test("should create stadium", async () => {
    const scene = createScene();
    const stadium = await createStadium(scene);
    expect(stadium.name).toBe("stadium");
    expect(scene.children).includes(stadium);
  });
});
