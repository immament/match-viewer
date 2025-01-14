import { describe, expect, test } from "vitest";
import { createCamera } from "../camera";

describe("camera", () => {
  test("createCamera", () => {
    const expected = { aspect: 3 };
    const camera = createCamera(expected.aspect);

    expect(camera.aspect).toBe(expected.aspect);
  });
});
