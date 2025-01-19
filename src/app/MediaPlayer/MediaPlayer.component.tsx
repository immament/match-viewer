import "./mediaPlayer.scss";
import { IMediaPlayerComponent, MediaPlayer } from "./MediaPlayer";
import { ProgressHolder } from "./ProgressHolder";
import { createRef } from "jsx-dom";
import screenfull from "screenfull";

export class MediaPlayerComponent implements IMediaPlayerComponent {
  private _progressHolder: ProgressHolder;
  // private _mediaPlayer?: MediaPlayer;
  private _playButton: PlayButton;
  private _fullscreenButton: FullscreenButton;

  public get timeChanged(): ((percent: number) => void) | undefined {
    return this._progressHolder.timeChanged;
  }
  public set timeChanged(callback: ((percent: number) => void) | undefined) {
    this._progressHolder.timeChanged = callback;
  }

  public play?: (() => boolean) | undefined;

  constructor() {
    this._progressHolder = new ProgressHolder();

    this._playButton = new PlayButton();
    this._playButton.onClick = this.playClick;
    this._fullscreenButton = new FullscreenButton();
  }

  setMediaElem(container: HTMLElement): void {
    this._fullscreenButton?.setMediaElem(container);
  }

  public setMediaPlayer(player: MediaPlayer): void {
    // this._mediaPlayer = player;
    this._progressHolder.setMediaPlayer(player);
  }

  private playClick = () => {
    this._playButton.setPaused(!this.play?.());
  };

  // private fullscreenClick = () => {
  //   this._fullscreenButton?.setInFullscreen(!this.fullscreen?.());
  // };

  public setFormattedTime(value: string): void {
    this._progressHolder.setFormattedTime(value);
  }

  public setProgress(value: number): void {
    this._progressHolder.setProgress(value);
  }
  public enable(): void {
    this._progressHolder.enable();
  }

  render(): HTMLElement {
    const result = (
      <div class="mv-control-bar">{this._playButton.render()}</div>
    ) as HTMLElement;
    // as HTMLDivElement & { debug?: { component: unknown } };

    result.appendChild(this._progressHolder.render());
    if (this._fullscreenButton) {
      result.appendChild(this._fullscreenButton.render());
    }

    return result;
  }
}

class PlayButton {
  private _iconRef = createRef<HTMLElement>();

  public onClick?: () => void;

  public setPaused(isPaused: boolean) {
    if (this._iconRef.current)
      this._iconRef.current.className = isPaused ? "bx bx-play" : "bx bx-pause";
  }
  render() {
    return (
      <button class="mv-play-control" onClick={this.onClick}>
        <i class={"bx bx-play"} ref={this._iconRef}></i>
      </button>
    );
  }
}

class FullscreenButton {
  private _iconRef = createRef<HTMLElement>();
  private _element?: HTMLElement;

  constructor() {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        this.setInFullscreen(screenfull.isFullscreen);
      });
    }
  }

  setMediaElem(anElement: HTMLElement) {
    this._element = anElement;
  }

  private onClick: () => void = () => {
    this.fullscreen();
  };

  private setInFullscreen(value: boolean) {
    if (this._iconRef.current) {
      this._iconRef.current.className = this.icon(value);
    }
  }

  private icon(isFullscreen: boolean): string {
    return isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen";
  }

  render() {
    if (!screenfull.isEnabled) return <></>;
    return (
      <button class="mv-play-control" onClick={this.onClick}>
        <i class={this.icon(screenfull.isFullscreen)} ref={this._iconRef}></i>
      </button>
    );
  }

  private fullscreen(): void {
    if (!screenfull.isEnabled || !this._element) return;

    // if (screenfull.isFullscreen) {
    //   document.exitFullscreen();
    // }

    screenfull.toggle(this._element);
  }
}
