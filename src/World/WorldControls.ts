import { Match } from "./components/match/Match.model";
import { IViewController } from "./IViewController";
import { logger } from "/app/logger";

export function initKeyboard(match: Match, controls: IViewController) {
  document.addEventListener(
    "keyup",
    ({ key }) => {
      switch (key) {
        case " ":
          match.playPause();
          break;
        case "n":
          match.moveTime(-1);
          break;
        case "m":
          match.moveTime(1);
          break;
        case "b":
          match.moveTime(-0.1);
          break;
        case ",":
          match.moveTime(0.1);
          break;
        case "c":
          logger.debug("camera:", controls.camera, controls.camera.position);
          logger.debug("target:", controls.getCameraTarget());
          break;
        case "z":
          controls.zoomToTarget(5);
          break;
      }
    },
    { passive: true }
  );
}
