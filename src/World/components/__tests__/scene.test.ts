import { Scene } from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { describe, expect, it, vi } from "vitest";
import { createScene } from "../scene";

vi.mock("three");

Scene.prototype.children = [];

describe("scene", () => {
  it("createScene", () => {
    const scene = createScene();

    expect(scene).toBeTruthy();
    expect(vi.mocked(scene.add).mock.calls[0][0]).instanceOf(Sky);
  });
});
