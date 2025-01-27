import "boxicons/css/boxicons.css";
import type { World } from "./World/World";
import { initKeyboard } from "./World/WorldControls";
import { createWorld } from "./World/world.factory";
import { createMatchOverlays as createMatchPlayer } from "./app/MediaPlayer/MediaPlayer.factory";
import { logger } from "./app/logger";
import { mainReact } from "./main.react";
import "./style.scss";

const urlParams = new URLSearchParams(window.location.search);
const DEBUG_MODE = urlParams.has("dbg");
const THREE_CONTAINER_ID = "app";

if (DEBUG_MODE) {
  document.body.classList.add("debug");
} else {
  logger.setLevel("INFO");
  logger.getLogger("player").setLevel("INFO");
}

const LOAD_WORLD = false;

async function main() {
  mainReact(THREE_CONTAINER_ID);

  if (!LOAD_WORLD) return;
  const matchPlayer = createMatchPlayer();
  const world = await initWorld(THREE_CONTAINER_ID);
  if (matchPlayer && world.debug_match) {
    matchPlayer.setMedia(world.debug_match);

    initKeyboard(
      world.debug_match,
      world.debug_controls,
      matchPlayer.mediaPlayer
    );
  }
}

async function initWorld(containerId: string): Promise<World> {
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Html element #${containerId} not found.`);
  }
  const world = await createWorld(container, DEBUG_MODE);
  // start the animation loop
  world.start();
  return world;
}

main();
