import { IViewController } from "src/World/IViewController";
import { IUpdatable, MediaPlayer } from "./MediaPlayer";

// Implemets by Match

export interface IMedia {
  time: number;
  get duration(): number;

  timeScale(): number;
  modifyTimeScale(timeScale: number): void;
  pause(): void;
  continue(): void;
  tooglePlay(): boolean;
  addUpdatable(updatable: IUpdatable): void;
}

export interface IMatch extends IMedia {
  get viewController(): IViewController;
  followBall(value: boolean): void;
  followPlayerByIndex(index: number): void;
  get isFollowBall(): boolean;
}

export interface IMediaPlayerComponent {
  setMedia(media: IMedia): void;
  setMediaElem(container: HTMLElement): void;
  setMediaPlayer(player: MediaPlayer): void;
  enable(): void;
  render(container: HTMLElement | undefined): HTMLElement;
  setProgress(value: number): void;
  setFormattedTime(time: string): void;
  setPlayStatus(isPlaying: boolean): void;
}

export interface IMediaPlayer {
  percentToDisplayTime(value: number): string;
  tooglePlay(): boolean;
  gotoPercentTime(value: number): void;
  changePlaybackSpeed(value: number): void;
}

export interface IButton {
  render(): void;
}
