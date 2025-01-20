import { AnimationClip } from "three";
import { describe, expect, test, vi } from "vitest";
import { ModelConfig } from "../ModelConfig";
import { PoseTypes } from "../animations/Pose.model";

describe("ModelConfig", () => {
  const _meshPath = "path";

  test("should initialize with default values", () => {
    const getMeshFn = vi.fn();

    const modelConfig = new ModelConfig(_meshPath, getMeshFn);

    expect(modelConfig.modelPath).toBe(_meshPath);
    expect(modelConfig.getMeshFn).toBe(getMeshFn);
  });

  test("should find clip by index", () => {
    const modelConfig = new ModelConfig(_meshPath, vi.fn(), {
      [PoseTypes.head]: 1
    });

    const expectedClip = {} as AnimationClip;
    const clips: AnimationClip[] = [{} as AnimationClip, expectedClip];

    const result = modelConfig.animationClip(clips, PoseTypes.head);

    expect(result).toBe(expectedClip);
  });

  test("should find clip by name", () => {
    const modelConfig = new ModelConfig(_meshPath, vi.fn(), undefined, {
      [PoseTypes.idle]: "idle"
    });

    const expectedClip = { name: "idle" } as AnimationClip;
    const clips: AnimationClip[] = [{} as AnimationClip, expectedClip];

    const result = modelConfig.animationClip(clips, PoseTypes.idle);

    expect(result).toBe(expectedClip);
    expect(result?.name).toBe("idle");
  });
});
