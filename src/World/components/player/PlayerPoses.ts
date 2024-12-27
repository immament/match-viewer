import { AnimationMixer } from "three";

import {
  logDebugTransition,
  playerLogger
} from "../../components/player/player.logger";
import { PlayerActions } from "./animations/PlayerActions";
import {
  PoseAction,
  PoseAnimationAction,
  PoseRecord
} from "./animations/PoseAction";
import { timeToStep } from "./animations/positions";
import { ILabelUpdater } from "./ILabelUpdater";
import { PlayerId } from "./PlayerId";
import { PoseTransitionProps } from "./PoseTransitionProps";
import { logger } from "/app/logger";
import { round } from "/app/utils";

export type PoseChangedEventDetail = {
  player: PlayerId;
  pose: PoseRecord | undefined;
};

// manage switch player pose (animation)
export class PlayerPoses extends EventTarget {
  // TODO: DEBUG
  private _labelUpdater: ILabelUpdater | undefined;

  private _currentPose?: PoseRecord = undefined;
  private _forceUpdatePose = false;
  private _syncCrossFade = false;
  private _warping = false;
  private _pause = false;

  constructor(
    private _playerId: PlayerId,
    private _mixer: AnimationMixer,
    private _actions: PlayerActions,
    private _poses: PoseRecord[]
  ) {
    super();
  }

  public get currentPose(): PoseRecord | undefined {
    return this._currentPose;
  }
  public get syncCrossFade() {
    return this._syncCrossFade;
  }
  public set syncCrossFade(value) {
    this._syncCrossFade = value;
  }
  public get playerId(): PlayerId {
    return this._playerId;
  }
  public get pause() {
    return this._pause;
  }
  public set pause(value) {
    this._pause = value;
  }

  public forceUpdatePose() {
    this._forceUpdatePose = true;
  }

  public setCurrentPose(newPose: PoseRecord | undefined) {
    if (newPose?.action) newPose.action.animation.poseRecord = newPose;
    this._currentPose = newPose;
    this.dispatchEvent(
      new CustomEvent<PoseChangedEventDetail>("poseChanged", {
        detail: { player: this._playerId, pose: newPose }
      })
    );
  }

  // get and set pose for current time (AnimationMixer time)
  public updatePose(mixerUpdateDelta: number): void {
    if (!mixerUpdateDelta && !this._forceUpdatePose) return;

    if (this.pause) return;

    const poseTime = this._mixer.time + mixerUpdateDelta;
    const newPose = this.poseForTime(poseTime);

    if (newPose === this._currentPose) return;

    const props = this.createPoseTransitionProps(newPose, poseTime);

    if (this._forceUpdatePose) {
      this.clearLastPoseAction(props);
    }

    if (props.newPoseAction) {
      this.switchPose(props);
    }
    this.updateLabel();
  }

  private createPoseTransitionProps(
    newPose: PoseRecord,
    time: number,
    step?: string | number,
    withSync?: boolean
  ): PoseTransitionProps {
    if (!newPose.action)
      newPose.action = this._actions.getPoseAction(newPose.type);
    return {
      transitionId: this.newTransitionId(step ?? newPose.step),
      newPoseAction: newPose.action,
      newPoseRecord: newPose,
      withSync: withSync ?? this.syncCrossFade,
      oldPoseAction: this.currentAction,
      mixterTime: time
    };
  }

  public switchPoseTo(newPose: PoseRecord, withSync: boolean) {
    const props: PoseTransitionProps = this.createPoseTransitionProps(
      newPose,
      this._mixer.time,
      "spt",
      withSync
    );
    if (!newPose.action) {
      playerLogger.warn(this._playerId, "Pose not found:", newPose.type);
      return;
    }

    this.switchPose(props);
  }

  // ++ INTERNALS +++

  private get currentAction(): PoseAction | undefined {
    return this._currentPose?.action;
  }

  private _lastTransitionId = -1;
  private newTransitionId(step: number | string): string {
    return `${step}-${++this._lastTransitionId}`;
  }

  private poseForTime(time: number): PoseRecord {
    let roundedTime = timeToStep(time);
    if (roundedTime >= this._poses.length) roundedTime = this._poses.length - 1;
    return this._poses[roundedTime];
  }

  private switchPose(props: PoseTransitionProps) {
    if (this.currentAction === props.newPoseAction) {
      props.newPoseAction.animation.setEffectiveTimeScale(
        props.newPoseRecord.timeScale
      );
      logDebugTransition(this._playerId, "{Keep Pose}:", props);
      this.setCurrentPose(props.newPoseRecord);
      this.updateLabel();
      return;
    }

    if (this.currentAction) {
      this.switchAction(props);
    } else {
      logDebugTransition(this._playerId, "{Start Pose}:", props);
      this.setCurrentPose(props.newPoseRecord);
      props.newPoseAction.startAction(props.newPoseRecord);
    }
    this.updateLabel();
  }

  private clearLastPoseAction(props: PoseTransitionProps): void {
    if (this.currentAction) {
      playerLogger.debug(
        this.playerId,
        props.transitionId,
        "{clear Last}:",
        this.currentAction.poseType
      );
      this.currentAction.animation.setEffectiveWeight(0);
      this.currentAction.animation.enabled = false;
      this.setCurrentPose(undefined);
      this.updateLabel();
    }

    this._forceUpdatePose = false;
  }

  private updateLabel() {
    this._labelUpdater?.updateLabel(
      this._labelUpdater.createLabelText(this._currentPose, this._mixer.time)
    );
  }

  private switchAction(props: PoseTransitionProps): boolean {
    logDebugTransition(
      this._playerId,
      "{switch Action}:",
      props,
      props.newPoseRecord.rotation,
      props.newPoseRecord.direction,
      props.newPoseRecord.lastDirection
    );

    if (props.withSync && props.oldPoseAction) {
      this.synchronizeCrossFade(props);
    } else {
      this.executeCrossFade(props);
    }
    this.setCurrentPose(props.newPoseRecord);
    return true;
  }

  private synchronizeCrossFade(props: PoseTransitionProps) {
    if (
      !this.currentAction ||
      this.currentAction.animation.getEffectiveWeight() < 0.1
    ) {
      logDebugTransition(
        this._playerId,
        "{synchronizeCrossFade skipped}:",
        props,
        this.currentAction
          ? "old action weight to low:" +
              round(this.currentAction.animation.getEffectiveWeight())
          : "old action not set"
      );
      this.executeCrossFade(props);
      return;
    }

    logDebugTransition(this._playerId, "{synchronizeCrossFade}:", props);

    this._mixer.addEventListener(
      "loop",
      getOnLoopFinished(this, this.currentAction)
    );

    function getOnLoopFinished(
      aPlayerPose: PlayerPoses,
      anOldAction: PoseAction
    ) {
      const onLoopFinished = (event: {
        action: PoseAnimationAction;
        loopDelta: number;
      }) => {
        if (event.action === anOldAction.animation) {
          logDebugTransition(
            aPlayerPose.playerId,
            `{getOnLoopFinished}:`,
            props,
            "hasEventListener:",
            aPlayerPose._mixer.hasEventListener("loop", onLoopFinished)
          );

          aPlayerPose._mixer.removeEventListener("loop", onLoopFinished);
          aPlayerPose.executeCrossFade(props);
        }
      };
      return onLoopFinished;
    }
  }

  private executeCrossFade(props: PoseTransitionProps) {
    logDebugTransition(this._playerId, "{executeCrossFade}:", props);

    if (this.currentAction !== props.oldPoseAction) {
      logger.warn("this.currentAction !==props.oldAction", props);
    }

    const newAnimation = props.newPoseAction.animation;
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    newAnimation.enabled = true;
    newAnimation.setEffectiveTimeScale(props.newPoseRecord.timeScale);
    newAnimation.setEffectiveWeight(1);
    if (this._mixer.timeScale >= 0) {
      newAnimation.time = props.newPoseRecord.startFrom ?? 0;

      props.oldPoseAction?.animation.crossFadeTo(
        newAnimation,
        props.newPoseRecord.fadeTime ?? 0.1,
        this._warping
      );
    } else {
      newAnimation.time = newAnimation.getClip().duration;
      if (props.oldPoseAction) {
        //props.oldAction.animation.syncWith(newAnimation);
        //props.oldAction.animation.halt(0.1);
        props.oldPoseAction.animation.enabled = false;
      }
    }

    //logDebugTransition(this._player, "{executeCrossFade}:", props);
  }
}
