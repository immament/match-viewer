import GUI from "lil-gui";
import {
  createMatchSettings,
  MatchSettings
} from "./components/match/debug/match.settings";
import { Match } from "./components/match/Match.model";
import { PlayerDebug } from "./components/player/debug/PlayerDebug";
import { createPlayerSettings } from "./components/player/debug/PlayerSettingsBuilder";
import { MatchDebug } from "./systems/debug/debug";
import { isDebugPlayerByIdx } from "./systems/debug/debug.constants";
import { createSettingsPanel } from "./systems/debug/settings";
import { World } from "./World";

export async function createWorld(
  container: HTMLElement,
  debug = false
): Promise<World> {
  const world = new World(container);

  await world.init();
  if (debug) {
    const settingsPanel = createSettingsPanel(world);

    if (world.debug_match) {
      MatchDebug.init(world.debug_match);
      const matchSettings = createMatchSettings(
        settingsPanel,
        world.debug_match,
        world.debug_controls.camera,
        world.debug_controls
      );
      world.addToLoop(matchSettings);
      world.addToLoop(MatchDebug.instance);
      createPlayersDebug(
        settingsPanel,
        world,
        world.debug_match,
        matchSettings
      );
      matchSettings.init();
    }
  }

  return world;
}

function createPlayersDebug(
  settingsPanel: GUI,
  world: World,
  match: Match,
  matchSettings: MatchSettings
) {
  for (let index = 0; index < 22; index++) {
    const player = match.getPlayerByIdx(index);
    if (!player) continue;
    const playerDebug = new PlayerDebug(player);
    matchSettings.addPlayerDebug(playerDebug);
    match.addUpdatable(playerDebug);
    if (isDebugPlayerByIdx(index)) {
      // playerDebug.isActive = true;
      match.addUpdatable(playerDebug);
      const playerSettings = createPlayerSettings(
        settingsPanel,
        player,
        playerDebug,
        match
      );
      if (playerSettings) {
        world.addToLoop(playerSettings);
      }
    }
  }
}

// pl.poses.addEventListener("poseChanged", (ev) => {
//   const pcEv = ev as CustomEvent<PoseChangedEventDetail> & {
//     target: PlayerPoses;
//   };
//   if (pcEv.detail.pose?.action?.isPose) {
//     this.followPlayer(pcEv.target.player);
//   }
// });
