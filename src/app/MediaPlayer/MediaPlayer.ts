import { IMedia, IMediaPlayer, IMediaPlayerComponent } from "./media.model";

export interface IUpdatable {
  tick(delta: number, realDelta?: number): void;
}

export class MediaPlayer implements IMediaPlayer, IUpdatable {
  private _media?: IMedia;
  private _container?: HTMLElement;

  constructor(private _mpComponent: IMediaPlayerComponent, aMedia?: IMedia) {
    this._mpComponent.setMediaPlayer(this);
    if (aMedia) {
      this.setMedia(aMedia);
    }
  }

  setMedia(media: IMedia) {
    if (media) {
      this._media = media;
      this.time = media.time;
      this._mpComponent.setMedia(media);
      this._mpComponent.enable();
      media.addUpdatable(this);
    }
  }

  public get time(): number {
    return this._media?.time ?? 0;
  }
  public set time(value: number) {
    if (!this._media) return;
    this._media.time = Math.max(Math.min(value, this.totalTime), 0);

    this.update();
  }

  public get totalTime(): number {
    return this._media?.duration ?? 0;
  }

  // ++ IMediaPlayer ++

  // value in range [0..1]
  gotoPercentTime(value: number) {
    this.time = this.totalTime * value;
  }

  percentToDisplayTime(value: number): string {
    return this.formatTime(value * this.totalTime);
  }

  tooglePlay(): boolean {
    const isPlaying = this._media?.tooglePlay() ?? false;
    this._mpComponent.setPlayStatus(isPlaying);
    return isPlaying;
  }

  changePlaybackSpeed(value: number): void {
    this._media?.modifyTimeScale(value);
  }

  // -- IMediaPlayer end --

  // createEl(container?: HTMLElement): HTMLDivElement {
  //   const elem = this.render();
  //   this._container = container;
  //   container?.appendChild(elem);
  //   if (container) {
  //     this._mpComponent.setMediaElem(container);
  //   }
  //   return elem;
  // }

  // render() {
  //   const result = this._mpComponent.render(this._container);
  //   // result.debug = { component: this };
  //   return result as HTMLDivElement;
  // }

  // ++ IUpdatable ++
  tick(): void {
    if (this._media) {
      this.update();
    }
  }
  // -- IUpdatable end --

  // + component updates

  private update() {
    this.updateFormattedTime();
    this.updateProgress();
  }
  private updateFormattedTime() {
    this._mpComponent.setFormattedTime(this.formatTime(this.time));
  }

  private updateProgress() {
    this._mpComponent.setProgress(this.progressPercent());
  }
  // - component updates end

  private progressPercent(): number {
    if (!this.totalTime) return 0;
    return Math.round((this.time / this.totalTime) * 10000) / 100;
  }

  private formatTime(time: number): string {
    return `${minute()}:${second()}`;

    function minute() {
      return String(Math.floor(time / 60)).padStart(2, "0");
    }
    function second() {
      return String(Math.floor(time % 60)).padStart(2, "0");
    }
  }
}
