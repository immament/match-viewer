import { AnimationAction, AnimationMixer } from "three";

import { logDebugTransition, logger, playerLogger } from "@/app/logger";
import { round } from "@/app/utils";
import { PlayerActions } from "./animations/PlayerActions";
import { PoseRecord } from "./animations/Pose.model";
import { PoseAction } from "./animations/PoseAction";
import { timeToStep } from "./animations/positions";
import { Player } from "./Player.model";

export type PoseChangedEventDetail = {
  player: Player;
  pose: PoseRecord | undefined;
};

export class PlayerPoses extends EventTarget {
  public get player(): Player {
    return this._player;
  }

  private _currentPose?: PoseRecord = undefined;
  public get currentPose(): PoseRecord | undefined {
    return this._currentPose;
  }

  private _forceUpdatePose = false;
  private _syncCrossFade = false;
  private _warping = false;

  public get syncCrossFade() {
    return this._syncCrossFade;
  }
  public set syncCrossFade(value) {
    this._syncCrossFade = value;
  }
  private _pause = false;
  public get pause() {
    return this._pause;
  }
  public set pause(value) {
    this._pause = value;
  }

  constructor(
    private _player: Player,
    private _mixer: AnimationMixer,
    private _actions: PlayerActions,
    private _poses: PoseRecord[]
  ) {
    super();
  }

  public forceUpdatePose() {
    this._forceUpdatePose = true;
  }

  public setCurrentPose(newPose: PoseRecord | undefined) {
    if (newPose?.action) newPose.action.animation.poseRecord = newPose;
    this._currentPose = newPose;
    this.dispatchEvent(
      new CustomEvent<PoseChangedEventDetail>("poseChanged", {
        detail: { player: this._player, pose: newPose }
      })
    );
  }

  private get currentAction(): PoseAction | undefined {
    return this._currentPose?.action;
  }

  public updatePose(mixerUpdateDelta: number): void {
    if (!mixerUpdateDelta && !this._forceUpdatePose) return;

    if (this.pause) return;

    const newPose = this.poseForTime(this._mixer.time + mixerUpdateDelta);
    // if (newPose.type === PoseTypes.head) {
    //   logger.warn("HEAD", this.player, this._mixer.time);
    // }

    if (newPose === this._currentPose) return;

    newPose.action = this._actions.getPoseAction(newPose.type);

    const props: PoseTransitionProps = {
      transitionId: this.newTransitionId(newPose.step),
      newAction: newPose.action,
      newPose,
      withSync: this.syncCrossFade,
      oldAction: this.currentAction,
      mixterTime: this._mixer.time + mixerUpdateDelta
    };

    // playerLogger.debug(
    //   this._player,
    //   this._mixer.time + mixerUpdateDelta,
    //   props.transitionId,
    //   newPose,
    //   this._lastPose
    // );

    if (this._forceUpdatePose) {
      this.clearLastPoseAction(props.transitionId);
    }

    if (props.newAction) {
      this.switchPose(props);
    }
    this.updateLabel();
  }

  public switchPoseTo(newPose: PoseRecord, withSync: boolean) {
    const newPoseAction = this._actions.getPoseAction(newPose.type);
    if (!newPoseAction) {
      playerLogger.warn(this._player, "Pose not found:", newPose.type);
      return;
    }
    this.switchPose({
      oldAction: this.currentAction,
      newAction: newPoseAction,
      newPose,
      withSync,
      transitionId: this.newTransitionId("spt"),
      mixterTime: this._mixer.time
    });
  }

  // private newDebugRequestIdRand(step: number | string): string {
  //   return `${step}-${Math.round(Math.random() * 10000)}`;
  // }

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
    if (this.currentAction === props.newAction) {
      props.newAction.animation.setEffectiveTimeScale(props.newPose.timeScale);
      logDebugTransition(this._player, "{Keep Pose}:", props);
      this.setCurrentPose(props.newPose);
      this.updateLabel();
      return;
    }

    if (this.currentAction) {
      this.switchAction(props);
    } else {
      logDebugTransition(this._player, "{Start Pose}:", props);
      this.setCurrentPose(props.newPose);
      props.newAction.startAction(props.newPose);
    }
    this.updateLabel();
  }

  private clearLastPoseAction(debugRequestId: string): void {
    if (this.currentAction) {
      this.logDebug(
        debugRequestId,
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
    this._player.debug.updateLabel(
      this._player.debug.createLabelText(this._currentPose, this._mixer.time)
    );
  }

  private switchAction(props: PoseTransitionProps): boolean {
    logDebugTransition(
      this._player,
      "{switch Action}:",
      props,
      props.newPose.rotation,
      props.newPose.direction,
      props.newPose.lastDirection
    );

    if (props.withSync && props.oldAction) {
      this.synchronizeCrossFade(props);
    } else {
      this.executeCrossFade(props);
    }
    this.setCurrentPose(props.newPose);
    return true;
  }

  private synchronizeCrossFade(props: PoseTransitionProps) {
    if (
      !this.currentAction ||
      this.currentAction.animation.getEffectiveWeight() < 0.1
    ) {
      logDebugTransition(
        this._player,
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

    logDebugTransition(this._player, "{synchronizeCrossFade}:", props);

    this._mixer.addEventListener(
      "loop",
      getOnLoopFinished(this, this.currentAction)
    );

    function getOnLoopFinished(
      aPlayerPose: PlayerPoses,
      anOldAction: PoseAction
    ) {
      const onLoopFinished = (event: {
        action: AnimationAction;
        loopDelta: number;
      }) => {
        if (event.action === anOldAction.animation) {
          logDebugTransition(
            aPlayerPose.player,
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
    logDebugTransition(this._player, "{executeCrossFade}:", props);

    if (this.currentAction !== props.oldAction) {
      logger.warn("this.currentAction !==props.oldAction", props);
    }

    const newAnimation = props.newAction.animation;
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    newAnimation.enabled = true;
    newAnimation.setEffectiveTimeScale(props.newPose.timeScale);
    newAnimation.setEffectiveWeight(1);
    if (this._mixer.timeScale >= 0) {
      newAnimation.time = props.newPose.startFrom ?? 0;

      props.oldAction?.animation.crossFadeTo(
        newAnimation,
        props.newPose.fadeTime ?? 0.1,
        this._warping
      );
    } else {
      newAnimation.time = newAnimation.getClip().duration;
      if (props.oldAction) {
        //props.oldAction.animation.syncWith(newAnimation);
        //props.oldAction.animation.halt(0.1);
        props.oldAction.animation.enabled = false;
      }
    }

    //logDebugTransition(this._player, "{executeCrossFade}:", props);
  }

  /// DEBUG Logs
  private logDebug(requestId: string, ...args: unknown[]) {
    if (this._player.debug.isActive) {
      playerLogger.debug(this._player, `[${requestId}]`, ...args);
    }
  }
}

export type PoseTransitionProps = {
  readonly oldAction: PoseAction | undefined;
  readonly newAction: PoseAction;
  readonly newPose: PoseRecord;
  readonly withSync: boolean;
  readonly transitionId: string;
  readonly mixterTime: number;
};

// if (lastAction.isMoveAction) {
//   if (newAction.isMoveAction) {
//     this.executeCrossFade({
//       oldAction: lastAction.animation,
//       newAction: newAction.animation,
//       duration: newPose.fadeTime ?? 0.1,
//       timeScale: newPose.actionSpeed
//     });
//   } else {
//     // not move poses is started immediately
//     lastAction.animation.fadeIn(newPose.fadeTime ?? 0.1);
//     newAction.startAction(newPose);
//   }

//   return true;
// }

// const checkIfPaused = false;

// if (lastAction.animation.paused || !checkIfPaused) {
//   this.logDebug(
//     0,
//     "lastAction.paused",
//     lastAction.name,
//     "=>",
//     newAction.name
//   );
//   this.executeCrossFade({
//     oldAction: lastAction.animation,
//     newAction: newAction.animation,
//     duration: this._forceUpdatePose ? 0 : 0.1,
//     timeScale: newPose.actionSpeed
//   });
//   return true;
// }
// return false;
