interface IUpdatable {
  tick(delta: number, realDelta?: number): void;
}

export interface IMedia {
  time: number;
  get duration(): number;

  pause(): void;
  continue(): void;
  playPause(): boolean;
  addUpdatable(updatable: IUpdatable): void;
}

export interface IMediaPlayerComponent {
  setMediaElem(container: HTMLElement): void;
  setMediaPlayer(player: MediaPlayer): void;
  enable(): void;
  render(container: HTMLElement | undefined): HTMLElement;
  setProgress(value: number): void;
  setFormattedTime(time: string): void;
  timeChanged?: (percent: number) => void;
  play?: () => boolean;
  fullscreen?: () => boolean;
}

export class MediaPlayer implements IUpdatable {
  private _media?: IMedia;
  private _container?: HTMLElement;

  constructor(private _mpComponent: IMediaPlayerComponent, aMedia?: IMedia) {
    this._mpComponent.setMediaPlayer(this);
    if (aMedia) {
      this.setMedia(aMedia);
    }

    this.initComponent();
  }

  setMedia(media: IMedia) {
    if (media) {
      this._media = media;
      this.time = media.time;
      this._mpComponent.enable();
      media.addUpdatable(this);
    }
  }

  tick(): void {
    if (this._media) {
      this.update();
    }
  }

  initComponent() {
    this._mpComponent.timeChanged = (percent) => {
      this.time = this.totalTime * percent;
    };
    this._mpComponent.play = () => this.play();
  }

  public percentToTime(value: number): string {
    return this.formatTime(value * this.totalTime);
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

  createEl(container?: HTMLElement): HTMLDivElement {
    const elem = this.render();
    this._container = container;
    container?.appendChild(elem);
    if (container) {
      this._mpComponent.setMediaElem(container);
    }
    return elem;
  }

  render() {
    const result = this._mpComponent.render(this._container);
    // result.debug = { component: this };
    return result as HTMLDivElement;
  }

  play(): boolean {
    return this._media?.playPause() ?? true;
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
