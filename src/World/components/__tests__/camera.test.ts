import { describe, expect, it } from "vitest";
import { createCamera } from "../camera";

describe("camera", () => {
  it("createCamera", () => {
    const expected = { aspect: 3 };
    const camera = createCamera(expected.aspect);

    expect(camera.aspect).toBe(expected.aspect);
  });
});
