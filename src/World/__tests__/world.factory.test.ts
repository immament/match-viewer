import { describe, expect, test, vi } from "vitest";
import { MatchSettings } from "../components/match/debug/match.settings";
import { Match } from "../components/match/Match.model";
import * as settingsMod from "../systems/debug/settings";
import { World } from "../World";
import { createWorld } from "../world.factory";
import { logger } from "/app/logger";

logger.disableAll();

// Mock dependencies
vi.mock(import("three"));
vi.mock(import("three/addons/libs/stats.module.js"));
vi.mock(import("three/examples/jsm/controls/OrbitControls.js"));
vi.mock(import("three/examples/jsm/loaders/GLTFLoader.js"));

vi.mock(import("../components/match/Match.model"));
vi.spyOn(Match.prototype, "durationMinutes", "get").mockReturnValue(10);

vi.mock(import("../components/match/debug/match.settings"), () => ({
  createMatchSettings: vi.fn(() => {
    return { init: vi.fn() } as unknown as MatchSettings;
  })
}));
vi.mock(import("../components/player/loadPlayers"), () => {
  return {
    loadPlayers: vi.fn().mockResolvedValue(() => ({ players: [] }))
  };
});

describe("createWorld", () => {
  test("should create a world and initialize it", async () => {
    const container = document.createElement("div");
    vi.spyOn(World.prototype, "init");
    const world = await createWorld(container, false);

    expect(world).toBeTruthy();
    expect(world.init).toHaveBeenCalled();
  });

  test("should create a world with debug mode enabled", async () => {
    vi.spyOn(settingsMod, "createSettingsPanel");
    const container = document.createElement("div");
    const world = await createWorld(container, true);

    expect(world).toBeInstanceOf(World);
    expect(world.init).toHaveBeenCalled();
    expect(settingsMod.createSettingsPanel).toHaveBeenCalledWith(world);
    // expect(MatchDebug.init).toHaveBeenCalledWith(world.debug_match);
    // expect(world.addToLoop).toHaveBeenCalled();
  });
});
