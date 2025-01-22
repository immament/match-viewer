import { IMatch } from "./media.model";
import { MatchMediaPlayer } from "./MatchMediaPlayer";

export function testJsx(media?: IMatch) {
  const playerContainer = document.getElementById("mediaPlayer");
  if (playerContainer) {
    return new MatchMediaPlayer(media, playerContainer);
  }
}
