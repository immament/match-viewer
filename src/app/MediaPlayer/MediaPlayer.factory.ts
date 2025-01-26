import { MatchMediaPlayer } from "./MatchMediaPlayer";
import { IMatchMedia } from "./media.model";

export function createMatchOverlays(media?: IMatchMedia) {
  const playerContainer = getPlayerContainer();
  if (playerContainer) {
    return new MatchMediaPlayer(media, playerContainer);
  }
}

export function getPlayerContainer() {
  return document.getElementById("mediaPlayer");
}
