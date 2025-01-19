import "boxicons/css/boxicons.css";
import type { World } from "./World/World";
import { createWorld } from "./World/world.factory";
import { testJsx } from "./app/MediaPlayer/MediaPlayer.factory";
import { logger } from "./app/logger";
import "./style.scss";

const urlParams = new URLSearchParams(window.location.search);
const DEBUG_MODE = urlParams.has("dbg");
const threeContainerId = "app";

if (!DEBUG_MODE) {
  logger.setLevel("INFO");
  logger.getLogger("player").setLevel("INFO");
}

async function main() {
  const player = testJsx();
  const world = await initWorld();
  if (world.debug_match) player?.setMedia(world.debug_match);
}

async function initWorld(): Promise<World> {
  const container = document.getElementById(threeContainerId);

  if (!container) {
    throw new Error(`Html element #${threeContainerId} not found.`);
  }
  const world = await createWorld(container, DEBUG_MODE);
  // start the animation loop
  world.start();
  return world;
}

main();
// .catch((err) => {
//   console.error("main error:", err);
// });
