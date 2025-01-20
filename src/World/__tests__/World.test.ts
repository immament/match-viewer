import StatsOrg from "three/addons/libs/stats.module.js";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { World } from "../World";

vi.mock("three");
vi.mock(import("three/addons/libs/stats.module.js"), () => {
  const Stats = vi.fn(() => ({
    dom: document.createElement("canvas")
  }));

  return { default: Stats as unknown as typeof StatsOrg };
});
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
