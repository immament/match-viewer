import { AnimationAction, AnimationMixer } from "three";

export type TimeChangedEventDetail = {
  scaledTime: number;
  timeInSeconds: number;
};

export class SceneDirector extends EventTarget {
  private _mixers: AnimationMixer[] = [];
  private _actions: AnimationAction[] = [];

  constructor(
    private _mainMixer: AnimationMixer,
    private _mainAction: AnimationAction
  ) {
    super();
    this.addActions(this._mainAction);
  }

  get time(): number {
    return this._mainMixer.time;
  }
  get timeInMinutes(): number {
    return this._mainMixer.time / 60;
  }
  get timeScale(): number {
    return this._mainMixer.timeScale;
  }

  get duration(): number {
    return this._mainAction.getClip().duration;
  }

  moveTime(deltaInSeconds: number) {
    const time = Math.max(0, this.time + deltaInSeconds);
    this.gotoTime(time);
  }
  gotoTime(timeInSeconds: number) {
    if (timeInSeconds < 0) timeInSeconds = 0;
    else if (timeInSeconds > this._mainAction.getClip().duration)
      timeInSeconds = this._mainAction.getClip().duration;

    //this.unPauseActions();
    const scaledTime = timeInSeconds / this.timeScale;
    this._mainMixer.setTime(scaledTime);
    this._mixers.forEach((m) => m.setTime(scaledTime));
    this._mainAction.paused = false;
    this._mainAction.time = timeInSeconds;

    this.dispatchEvent(
      new CustomEvent<TimeChangedEventDetail>("timeChanged", {
        detail: { scaledTime, timeInSeconds }
      })
    );
  }

  modifyTimeScale(timeScale: number) {
    this._mainMixer.timeScale = timeScale;

    this._mixers.forEach((m) => (m.timeScale = timeScale));
  }

  addMixer(aMixer: AnimationMixer): number {
    return this._mixers.push(aMixer);
  }

  addActions(...actions: AnimationAction[]) {
    return this._actions.push(...actions);
  }

  // private unPauseActions() {
  //   this._actions.forEach((a) => {
  //     a.paused = false;
  //   });
  // }
}
