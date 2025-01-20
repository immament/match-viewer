import { beforeEach, describe, expect, test } from "vitest";
import { PlayerId } from "../../PlayerId";
import { PlayerPositionProxy } from "../PlayerPositionProxy";

describe("PlayerPositionProxy", () => {
  const playerId: PlayerId = { teamIdx: 0, playerIdx: 1 };
  const positions = new Float32Array(6);

  beforeEach(() => {
    positions.set([0, 0, 0, 1, 1, 1]);
  });

  test("should initialize with default values", () => {
    const proxy = new PlayerPositionProxy(positions, playerId);
    expect(proxy.step).toBe(0);
    expect(proxy.x).toBe(0);
    expect(proxy.y).toBe(0);
    expect(proxy.z).toBe(0);
  });

  test("should update position on step change", () => {
    const proxy = new PlayerPositionProxy(positions, playerId);
    proxy.step = 1;
    expect(proxy.x).toBe(1);
    expect(proxy.y).toBe(1);
    expect(proxy.z).toBe(1);
  });

  test("should update x position", () => {
    const proxy = new PlayerPositionProxy(positions, playerId);
    proxy.x = 2;
    expect(positions[0]).toBe(2);
  });

  test("should update y position", () => {
    const proxy = new PlayerPositionProxy(positions, playerId);
    proxy.y = 2;
    expect(positions[1]).toBe(2);
  });

  test("should update z position", () => {
    const proxy = new PlayerPositionProxy(positions, playerId);
    proxy.z = 2;
    expect(positions[2]).toBe(2);
  });
});
