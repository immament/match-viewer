import { FollowObjectButton } from "./components/FollowObject.button";
import { MediaPlayerComponent } from "./components/MediaPlayer.component";
import { IMatch } from "./media.model";
import { MediaPlayer } from "./MediaPlayer";

export class MatchMediaPlayer {
  private _followButton: FollowObjectButton;
  private _mediaPlayer: MediaPlayer;
  public get mediaPlayer(): MediaPlayer {
    return this._mediaPlayer;
  }

  setMedia(match: IMatch) {
    match.modifyTimeScale(2);
    this._mediaPlayer.setMedia(match);
    this._followButton.setMatch(match);
  }

  constructor(media: IMatch | undefined, playerContainer: HTMLElement) {
    this._followButton = new FollowObjectButton(media);
    const buttons = [this._followButton];
    this._mediaPlayer = new MediaPlayer(
      new MediaPlayerComponent(media, buttons),
      media
    );
    this._mediaPlayer.createEl(playerContainer);
  }
}
