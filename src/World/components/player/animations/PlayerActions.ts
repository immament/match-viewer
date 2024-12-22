import { AnimationAction } from "three";

import { PlayerId } from "../PlayerId";
import { PoseTypes } from "./Pose.model";
import { PoseAction } from "./PoseAction";

export class PlayerActions {
  public get positionAction(): AnimationAction {
    return this._positionAction;
  }
  public get rotateAction(): AnimationAction {
    return this._rotateAction;
  }

  private _moveAnimations: AnimationAction[];
  public get allMoveAnimations(): AnimationAction[] {
    return [...this._moveAnimations];
  }
  public get poseActions(): PoseAction[] {
    return Object.values(this._poseActions);
  }

  constructor(
    private _positionAction: AnimationAction,
    private _rotateAction: AnimationAction,
    private _poseActions: Record<PoseTypes, PoseAction>,
    _playerId: PlayerId
  ) {
    this._moveAnimations = [_positionAction, _rotateAction];

    Object.values(_poseActions).forEach((a) => {
      a.animation.playerId = _playerId;
      if (a.isMove) {
        a.animation.setEffectiveWeight(0);
        this._moveAnimations.push(a.animation);
        a.animation.play();
      }
    });

    this._positionAction.play();
    this._rotateAction.play();
  }

  public getPoseAction(poseType: PoseTypes): PoseAction {
    return this._poseActions[poseType];
  }

  stopAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.stop();
    });
  }

  playAllMoveActions() {
    //playerLogger.info(this._playerId, "playAllMoveActions");
    this._moveAnimations.forEach((action) => {
      action.play();
    });
  }

  disableAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.enabled = false;
    });
  }

  pauseAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.paused = true;
    });
  }

  unPauseAllMoveActions() {
    this._moveAnimations.forEach((action) => {
      action.paused = false;
    });
  }
  setTime(timeInSeconds: number) {
    this._positionAction.time = timeInSeconds;
    this._rotateAction.time = timeInSeconds;
  }
}
