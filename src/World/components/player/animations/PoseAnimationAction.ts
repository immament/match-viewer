import {
  AnimationAction,
  AnimationBlendMode,
  AnimationClip,
  AnimationMixer,
  Object3D
} from "three";
import { PlayerId } from "../PlayerId";
import { PoseTypes } from "./Pose.model";
import {
  IPoseAction,
  PoseActionState,
  PoseRecord,
  PoseTransitionProps
} from "./PoseAction.model";

export class PoseAnimationAction
  extends AnimationAction
  implements IPoseAction
{
  public poseRecord?: PoseRecord;

  constructor(
    private _isMove: boolean,
    private _poseType: PoseTypes,
    private _playerId: PlayerId,
    mixer: AnimationMixer,
    clip: AnimationClip,
    localRoot?: Object3D,
    blendMode?: AnimationBlendMode
  ) {
    super(mixer, clip, localRoot, blendMode);
    // _animation.poseAction = this;
  }

  get name(): string {
    return this.getClip().name ?? "-";
  }
  get isMove(): boolean {
    return this._isMove;
  }
  get isPose(): boolean {
    return !this._isMove;
  }
  get poseType(): PoseTypes {
    return this._poseType;
  }
  public set poseType(value: PoseTypes) {
    this._poseType = value;
  }

  canSyncCrossFadeFrom(): boolean {
    return this.getEffectiveWeight() < 0.1;
  }

  startAction(pose: PoseRecord, reverse = false): boolean {
    if (this._poseType !== pose.type) return false;
    this.reset();
    if (reverse) {
      this.time = this.getClip().duration;
    } else if (pose.startFrom) {
      this.time = pose.startFrom;
    }

    this.setEffectiveTimeScale(pose.timeScale);
    this.setEffectiveWeight(1);
    this.play();
    return true;
  }

  stopAction(): void {
    this.setEffectiveWeight(0);
    this.enabled = false;
  }

  executeCrossFade(
    props: PoseTransitionProps,
    warping: boolean,
    reverse: boolean = false
  ): void {
    this.enabled = true;
    this.setEffectiveTimeScale(props.newPoseRecord.timeScale);
    this.setEffectiveWeight(1);
    this.getMixer();
    if (reverse) {
      this.time = this.getClip().duration;
      if (props.oldPoseAction) {
        props.oldPoseAction.enabled = false;
      }
      return;
    }

    this.time = props.newPoseRecord.startFrom ?? 0;
    props.oldPoseAction?.crossFadeTo(
      this,
      props.newPoseRecord.fadeTime ?? 0.1,
      warping
    );
  }

  theSameAction(action: AnimationAction): boolean {
    return this === action;
  }

  debug_state(): PoseActionState {
    return {
      enabled: this.enabled,
      isRunning: this.isRunning(),
      paused: this.paused,
      weight: this.weight,
      weightEff: this.getEffectiveWeight(),
      timeScale: this.timeScale,
      timeScaleEff: this.getEffectiveTimeScale(),
      time: this.time
    };
  }

  debug_animation(): AnimationAction {
    return this;
  }
}
