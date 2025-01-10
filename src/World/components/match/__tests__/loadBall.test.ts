import { TextureLoader } from "three";
import { describe, expect, it, vi } from "vitest";
import { Ball } from "../ball";
import { createPositionsArrays, loadBall } from "../loadBall";

vi.mock("three");

describe("loadBall", () => {
  it("should load ball", async () => {
    const { ball } = await loadBall();

    expect(ball).toBeTruthy();
    expect(ball).instanceOf(Ball);
  });

  it("should create mixer", async () => {
    const { ball } = await loadBall();

    expect(ball.mixer).toBeTruthy();
  });

  it("should create AnimationAction", async () => {
    const { ball } = await loadBall();

    expect(ball.action).toBeTruthy();
  });

  it("should create position arrays", async () => {
    const positions = createPositionsArrays({
      px: [1, 2],
      pHeight: [3, 4],
      pz: [5, 6]
    });

    expect(positions).toMatchObject({
      positions: [1, 3, 5, 2, 4, 6],
      times: [0, 0.5]
    });
  });

  it("should load texture", async () => {
    console.log("TextureLoader", TextureLoader.prototype);
    const textureLoaderSpy = vi.spyOn(TextureLoader.prototype, "load");
    await loadBall();
    expect(textureLoaderSpy).toHaveBeenCalled();
  });
});
