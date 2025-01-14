import { beforeAll, describe, expect, test, vi } from "vitest";
import { World } from "../World";
// import { threeMockSetup } from "/test-setup/three.mock.setup";

vi.mock("three");
// vi.mock("three/examples/jsm/renderers/CSS2DRenderer.js");
vi.mock("three/addons/libs/stats.module.js");
vi.mock("three/examples/jsm/controls/OrbitControls.js");

describe("World", () => {
  beforeAll(() => {
    // threeMockSetup({ webGLRenderer: true, camera: true, lights: true });
  });

  test("should create world", () => {
    const container = document.createElement("div");

    const world = new World(container);

    expect(world).toBeTruthy();
  });
});
