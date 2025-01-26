import "boxicons/css/boxicons.css";
import type { World } from "./World/World";
import { initKeyboard } from "./World/WorldControls";
import { createWorld } from "./World/world.factory";
import { createMatchOverlays as createMatchPlayer } from "./app/MediaPlayer/MediaPlayer.factory";
import { logger } from "./app/logger";
import "./style.scss";

const urlParams = new URLSearchParams(window.location.search);
const DEBUG_MODE = urlParams.has("dbg");
const threeContainerId = "app";

if (DEBUG_MODE) {
  document.body.classList.add("debug");
} else {
  logger.setLevel("INFO");
  logger.getLogger("player").setLevel("INFO");
}

async function main() {
  const matchPlayer = createMatchPlayer();
  const world = await initWorld();
  if (matchPlayer && world.debug_match) {
    matchPlayer.setMedia(world.debug_match);

    initKeyboard(
      world.debug_match,
      world.debug_controls,
      matchPlayer.mediaPlayer
    );
  }
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

async function importTest() {
  const matchId = Number(urlParams.get("did")) || 1663808;
  const matchData = await (
    await import("./World/components/match/dataSource/footstar.api")
  ).fetchFootstarMatchData(matchId);
  logger.info("matchData", matchData);
}

if (urlParams.has("did")) {
  importTest();
} else {
  main();
}
// .catch((err) => {
//   console.error("main error:", err);
// });
