import { MediaHeaderComponent } from "../MediaHeader/MediaHeader.component";
import { FollowObjectButton } from "./components/FollowObject.button";
import { MediaPlayerComponent } from "./components/MediaPlayer.component";
import { IMatchMedia } from "./media.model";
import { MediaPlayer } from "./MediaPlayer";

export class MatchMediaPlayer {
  private _followButton: FollowObjectButton;
  private _mediaPlayer: MediaPlayer;

  public get mediaPlayer(): MediaPlayer {
    return this._mediaPlayer;
  }

  setMedia(match: IMatchMedia) {
    match.modifyTimeScale(2);
    this._mediaPlayer.setMedia(match);
    this._followButton.setMatch(match);
  }

  constructor(media: IMatchMedia | undefined, playerContainer: HTMLElement) {
    this._followButton = new FollowObjectButton(media);
    const buttons = [this._followButton];
    const mediaPlayerComponent = new MediaPlayerComponent(media, buttons);
    this._mediaPlayer = new MediaPlayer(mediaPlayerComponent, media);
    mediaPlayerComponent.createEl(playerContainer);
  }
}
