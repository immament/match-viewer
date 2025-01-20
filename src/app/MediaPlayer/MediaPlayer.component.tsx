import "./mediaPlayer.scss";
import { IMediaPlayer, IMediaPlayerComponent } from "./media.model";
import { ProgressHolder } from "./ProgressHolder";
import { createRef, FocusEventHandler, MouseEventHandler } from "jsx-dom";
import screenfull from "screenfull";

export class MediaPlayerComponent implements IMediaPlayerComponent {
  private _progressHolder: ProgressHolder;
  private _mediaPlayer?: IMediaPlayer;
  private _playButton: PlayButton;
  private _fullscreenButton: FullscreenButton;
  private _speedButton: SpeedButton;

  constructor() {
    this._progressHolder = new ProgressHolder();

    this._playButton = new PlayButton();
    this._playButton.onClick = this.playClick;
    this._fullscreenButton = new FullscreenButton();
    this._speedButton = new SpeedButton();
    this._speedButton.onSpeedChange = (value) =>
      this._mediaPlayer?.changePlaybackSpeed(value);
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

  render(): HTMLElement {
    const result = (
      <div class="mv-control-bar">
        {this._progressHolder.render()}
        <div class="mv-buttons-line">
          {this._playButton.render()}
          <div class="mv-buttons-group">
            {this._speedButton.render()}
            {this._fullscreenButton?.render()}
          </div>
        </div>
      </div>
    ) as HTMLElement;
    // as HTMLDivElement & { debug?: { component: unknown } };

    return result;
  }
}

class SpeedButton {
  private _menuRef = createRef<HTMLDivElement>();
  private _labelRef = createRef<HTMLSpanElement>();

  public onSpeedChange?: (value: number) => void;

  private menuClicked = (ev: MouseEvent) => {
    ev.stopPropagation();
    const target = ev.target as HTMLElement;
    if (!target) return;
    const speed = Number(target.dataset.val);
    if (speed > 0) {
      this.onSpeedChange?.(speed);
      this.setSpeedLabel(speed);
      this.hideMenu();
    }
  };
  private openMenu = () => {
    if (this._menuRef.current) {
      this._menuRef.current.style.display = "block";
    }
  };
  private hideMenu = () => {
    if (this._menuRef.current) {
      this._menuRef.current.style.display = "none";
    }
  };
  blur: FocusEventHandler<HTMLButtonElement> = () => {
    this.hideMenu();
  };

  private setSpeedLabel(speed: number) {
    if (this._labelRef.current) {
      this._labelRef.current.textContent = speed !== 1 ? `x${speed}` : "";
    }
  }

  render() {
    return (
      <>
        <button
          class="mv-speed-control"
          onClick={this.openMenu}
          title="Playback Speed"
          onBlur={this.blur}
        >
          <i class={"bx bx-timer"}></i>
          <span ref={this._labelRef}></span>
          <div class="mv-popup-menu" ref={this._menuRef}>
            <div class="mv-menuheader">Playback Speed</div>
            <div onClick={this.menuClicked}>
              <div class="mv-menuitem" data-val="1">
                Normal
              </div>
              <div class="mv-menuitem" data-val="2">
                x2
              </div>
              <div class="mv-menuitem" data-val="4">
                x4
              </div>
              <div class="mv-menuitem" data-val="8">
                x8
              </div>
            </div>
          </div>
        </button>
      </>
    );
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
      <button class="mv-play-control" onClick={this.onClick} title="Play">
        <i class={"bx bx-play"} ref={this._iconRef}></i>
      </button>
    );
  }
}

class FullscreenButton {
  private _mediaElement?: HTMLElement;
  private _iconRef = createRef<HTMLElement>();

  constructor() {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        this.update(screenfull.isFullscreen);
      });
    }
  }

  setMediaElem(anElement: HTMLElement) {
    this._mediaElement = anElement;
  }

  private onClick: () => void = () => {
    this.toogleFullscreen();
  };

  private update(isFullscreen: boolean) {
    if (this._iconRef.current) {
      this._iconRef.current.className = this.icon(isFullscreen);
      this._iconRef.current.title = this.title(isFullscreen);
    }
  }

  private icon(isFullscreen: boolean): string {
    return isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen";
  }
  private title(isFullscreen: boolean): string {
    return isFullscreen ? "Exit Fullscreen" : "Fullscreen";
  }

  render() {
    if (!screenfull.isEnabled) return <></>;
    return (
      <button
        class="mv-fullscreen-control"
        onClick={this.onClick}
        title={this.title(screenfull.isFullscreen)}
      >
        <i class={this.icon(screenfull.isFullscreen)} ref={this._iconRef}></i>
      </button>
    );
  }

  private toogleFullscreen(): void {
    if (!screenfull.isEnabled || !this._mediaElement) return;

    screenfull.toggle(this._mediaElement);
  }
}
