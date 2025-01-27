import {
  IButton,
  IMedia,
  IMediaPlayer,
  IMediaPlayerComponent
} from "../media.model";
import { ProgressHolderComponent } from "./ProgressHolder.component";
import { PlayButton } from "./Play.button";
import { SpeedButton } from "./Speed.button";
import { FullscreenButton } from "./Fullscreen.button";

export class MediaPlayerComponent implements IMediaPlayerComponent {
  private _progressHolder: ProgressHolderComponent;
  private _mediaPlayer?: IMediaPlayer;
  private _playButton: PlayButton;
  private _fullscreenButton: FullscreenButton;
  private _speedButton: SpeedButton;

  constructor(
    private _media?: IMedia,
    private _buttons?: IButton[]
  ) {
    this._progressHolder = new ProgressHolderComponent();

    this._playButton = new PlayButton();
    this._playButton.onClick = this.playClick;
    this._fullscreenButton = new FullscreenButton();
    this._speedButton = new SpeedButton((value) =>
      this._mediaPlayer?.changePlaybackSpeed(value)
    );
  }

  public setMedia(media: IMedia): void {
    this._media = media;
    this._speedButton.setSpeed(media.timeScale());
    // this._followButton.setMedia(media);
  }

  public setMediaElem(container: HTMLElement): void {
    this._fullscreenButton?.setMediaElem(container);
  }

  public setMediaPlayer(player: IMediaPlayer): void {
    this._mediaPlayer = player;
    this._progressHolder.setMediaPlayer(player);
  }

  public setPlayStatus(isPlaying: boolean) {
    this._playButton.setPaused(!isPlaying);
  }

  private playClick = () => {
    this.setPlayStatus(!!this._mediaPlayer?.tooglePlay());
  };

  public setFormattedTime(value: string): void {
    this._progressHolder.setFormattedTime(value);
  }

  public setProgress(value: number): void {
    this._progressHolder.setProgress(value);
  }
  public enable(): void {
    this._progressHolder.enable();
  }

  // -- IMediaPlayer end --

  createEl(container?: HTMLElement): HTMLElement {
    const elem = this.render();
    // this._container = container;
    container?.appendChild(elem);
    if (container) {
      this.setMediaElem(container);
    }
    return elem;
  }

  render(): HTMLElement {
    const result = (
      <div class="mv-control-bar">
        {this._progressHolder.render()}
        <div class="mv-buttons-line">
          {this._playButton.render()}
          <div class="mv-buttons-group">
            <>{this._buttons?.map((bt) => bt.render())}</>
            {this._speedButton.render(this._media?.timeScale())}
            {this._fullscreenButton?.render()}
          </div>
        </div>
      </div>
    );

    return result as HTMLElement;
  }
}
