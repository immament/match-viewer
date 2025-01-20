import { PerspectiveCamera } from "three";
import { describe, expect, test, vi } from "vitest";
import { createControls } from "../controls";

vi.mock("three");
vi.mock("three/examples/jsm/controls/OrbitControls.js");

describe("controls", () => {
  test("create controls", () => {
    const container = document.createElement("div");

    const camera = new PerspectiveCamera();

    const controls = createControls(camera, container);

    expect(controls).toBeTruthy();
  });
});
