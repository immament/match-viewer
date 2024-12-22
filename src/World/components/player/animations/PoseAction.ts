import { AnimationAction } from "three";
import { PlayerId } from "../PlayerId";
import { PoseTypes } from "./Pose.model";

export class PoseAnimationAction extends AnimationAction {
  public poseAction?: PoseAction;
  public poseRecord?: PoseRecord;
  public playerId?: PlayerId;
}

export class PoseAction {
  public set poseType(value: PoseTypes) {
    this._poseType = value;
  }
  constructor(
    private _animation: PoseAnimationAction,
    private _isMove: boolean,
    private _poseType: PoseTypes
  ) {
    _animation.poseAction = this;
  }

  public get animation(): PoseAnimationAction {
    return this._animation;
  }

  get name(): string {
    return this._animation.getClip().name ?? "-";
  }

  get isMove(): boolean {
    return this._isMove;
  }
  get isPose(): boolean {
    return !this._isMove;
  }

  public get poseType(): PoseTypes {
    return this._poseType;
  }

  startAction(pose: PoseRecord, reverse = false) {
    this._animation.reset();
    if (reverse) {
      this._animation.time = this._animation.getClip().duration;
    } else if (pose.startFrom) {
      this._animation.time = pose.startFrom;
    }

    this._animation.setEffectiveTimeScale(pose.timeScale);
    this._animation.setEffectiveWeight(1);
    this._animation.play();
  }

  state() {
    return {
      enabled: this._animation.enabled,
      isRunning: this._animation.isRunning(),
      paused: this._animation.paused,
      weight: this._animation.weight,
      weightEff: this._animation.getEffectiveWeight(),
      timeScale: this._animation.timeScale,
      timeScaleEff: this._animation.getEffectiveTimeScale(),
      time: this._animation.time
    };
  }
}
export type PoseRecord = {
  readonly type: PoseTypes;
  readonly timeScale: number;
  readonly playerSpeed: number;
  readonly step: number;
  readonly startFrom?: number;
  readonly fadeTime?: number;
  readonly lockTime?: number;
  readonly iteration?: number;
  readonly rawPose?: string;
  readonly direction: number;
  readonly lastDirection?: number;
  // radions
  readonly rotation: number;
  action?: PoseAction;
};
