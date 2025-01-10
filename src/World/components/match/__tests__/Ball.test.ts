import { AnimationClip, AnimationMixer } from "three";
import { describe, expect, it, vi } from "vitest";
import { Ball } from "../ball";

vi.mock("three");

describe("Ball", () => {
  it("should initialize with default values", () => {
    const ball = new Ball();
    expect(ball.name).toBe("Ball");
    expect(ball.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(ball.rotation).toMatchObject({ x: 0, y: 0, z: 0 });
  });

  it("should set and get mixer and action", () => {
    const ball = new Ball();

    const mixer = new AnimationMixer(ball);
    const clip = new AnimationClip("clip", 1);

    const action = mixer.clipAction(clip);
    ball.setMixer(mixer, action);

    expect(ball.mixer).toBe(mixer);
    expect(ball.action).toBe(action);
  });

  it("should throw error if mixer or action is not set", () => {
    const ball = new Ball();
    expect(() => ball.mixer).toThrow("Ball mixer not set!");
    expect(() => ball.action).toThrow("Ball action not set!");
  });
  describe("tick", () => {
    it("should update position and rotation on tick", () => {
      const ball = new Ball();
      ball.position.set(1, 0, 1);

      // need call twice to get rotation
      ball.tick(0.016);
      ball.tick(0.016); // Assuming 60 FPS, so delta is 1/60

      expect(ball.rotation.x).not.toBe(0);
      expect(ball.rotation.z).not.toBe(0);
    });

    it("should update mixer time on tick", () => {
      const ball = new Ball();
      const mixer = new AnimationMixer(ball);
      const clip = new AnimationClip("clip", 1);
      const action = mixer.clipAction(clip);
      ball.setMixer(mixer, action);

      const delta = 0.016;
      ball.tick(delta);

      expect(ball.mixer.update).lastCalledWith(delta);
    });
  });
});
