import { TextureLoader } from "three";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { getBallPositions } from "../../player/__sampleData__/ball.mock";
import { BallPositionsConfig } from "../../player/animations/positions.utils";
import { Ball } from "../ball";
import { createPositionsArrays, loadBall } from "../loadBall";

vi.mock("three");
vi.mock(import("../../player/__sampleData__/ball.mock"));

describe("loadBall", () => {
  let ballPositions: BallPositionsConfig;
  beforeAll(() => {
    ballPositions = getBallPositions();
  });
  test("should load ball", async () => {
    const { ball } = await loadBall(ballPositions);

    expect(ball).toBeTruthy();
    expect(ball).instanceOf(Ball);
  });

  test("should create mixer", async () => {
    const { ball } = await loadBall(ballPositions);

    expect(ball.mixer).toBeTruthy();
  });

  test("should create AnimationAction", async () => {
    const { ball } = await loadBall(ballPositions);

    expect(ball.action).toBeTruthy();
  });

  test("should create position arrays", async () => {
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

  test("should load texture", async () => {
    const textureLoaderSpy = vi.spyOn(TextureLoader.prototype, "load");
    await loadBall(ballPositions);
    expect(textureLoaderSpy).toHaveBeenCalled();
  });
});
