import { IUpdatable, MediaPlayer } from "./MediaPlayer";

// Implemets by Match

export interface IMedia {
  time: number;
  get duration(): number;

  modifyTimeScale(timeScale: number): void;
  pause(): void;
  continue(): void;
  tooglePlay(): boolean;
  addUpdatable(updatable: IUpdatable): void;
}

export interface IMediaPlayerComponent {
  setMediaElem(container: HTMLElement): void;
  setMediaPlayer(player: MediaPlayer): void;
  enable(): void;
  render(container: HTMLElement | undefined): HTMLElement;
  setProgress(value: number): void;
  setFormattedTime(time: string): void;
  setPlayStatus(isPlaying: boolean): void;
}

export interface IMediaPlayer {
  percentToTime(value: number): string;
  tooglePlay(): boolean;
  gotoPercentTime(value: number): void;
  changePlaybackSpeed(value: number): void;
}
