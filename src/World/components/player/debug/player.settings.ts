import { AnimationAction, SkeletonHelper } from "three";

import { IUpdatable } from "@/World/systems/Loop";
import { Match } from "../../match/Match.model";
import { PoseTypes } from "../animations/Pose.model";
import { PoseRecord } from "../animations/PoseAction";
import { Player, Player3D } from "../Player.model";
import { PlayerDebug } from "./PlayerDebug";

export const poseTypes: PoseTypes[] = Object.values(PoseTypes);
export type ActionTypes = PoseTypes | "position" | "rotation";
export const actionTypes: ActionTypes[] = [
  ...poseTypes,
  "position",
  "rotation"
];

export type ActionSettings = {
  enabled: Partial<Record<ActionTypes, boolean>>;
  paused: Partial<Record<ActionTypes, boolean>>;
  weight: Partial<Record<ActionTypes, number>>;
  timeScale: Partial<Record<ActionTypes, number>>;
  isRunning: Partial<Record<ActionTypes, boolean>>;
  time: Partial<Record<ActionTypes, number>>;
};

export type PlayerSettingsFlags = PlayerSettings["settings"];
export type SwitchPoseSettings = Record<`to ${PoseTypes}`, () => void>;

export class PlayerSettings implements IUpdatable {
  private _model: Player3D;
  private _skeleton: SkeletonHelper;

  private _positionAnimation: AnimationAction;
  private _rotateAnimation: AnimationAction;

  private _settings = {
    "show model": true,
    "show skeleton": false,
    "stop all actions": () => this.stopAllActions(),
    "play all actions": () => this.playAllActions(),
    "debug play": false,
    "debug logs": false,
    "player log level": "DEBUG",
    "pause all actions": () => this.pauseAllActions(),
    "unpause all actions": () => this.unPauseAllActions(),
    "make single step": () => this.toSingleStepMode(),
    "mixer time [m]": 0,
    "mixer time [s]": 0,
    "pause poses change": false,
    "pause position & rotation": () => {
      this._positionAnimation.paused = true;
      this._rotateAnimation.paused = true;
      // this._player.actions.poseActions.forEach((p) =>
      //   p.animation.setEffectiveWeight(0)
      // );
    },
    "sync mixer": () => this.syncMixer(),
    "modify step size": 0.05,
    "with sync cross fade": true,
    "use default duration": true,
    "set custom duration": 3.5,
    "modify idle weight": 0.0,
    "modify walk weight": 1.0,
    "modify run weight": 0.0,
    "modify time scale": 1.0,
    "prepare test": () => this.debug_prepareTest()
  };

  public get settings() {
    return this._settings;
  }

  constructor(
    private _player: Player,
    private _playerDebug: PlayerDebug | undefined,
    private _match: Match,
    private _actionSettings: ActionSettings
  ) {
    ({ model: this._model, skeleton: this._skeleton } = _player);

    ({
      positionAction: this._positionAnimation,
      rotateAction: this._rotateAnimation
    } = _player.actions);
    this.importOnInit();
    this.exportOnInit();
  }

  private importOnInit() {
    this.settings["with sync cross fade"] = this._player.poses.syncCrossFade;
  }
  private exportOnInit() {
    this.debugLogs(this.settings["debug logs"]);
  }

  private debug_prepareTest() {
    this._settings["pause poses change"] = true;
    this.pausePoses(true);
    this._settings["pause position & rotation"]();
    // just to move ball
    // /this._match.changeMatchTime(1);
    this._match.followPlayer(this._player);
    this.getAction(PoseTypes.walk).timeScale = 0.2;
    //this._settings["debug play"] = true;
    this.debugPlay(true);
  }

  syncCrossFade(enabled: boolean) {
    this._player.poses.syncCrossFade = enabled;
  }
  debugPlay(enabled: boolean) {
    if (this._playerDebug) this._playerDebug.debugPlay = enabled;
  }
  debugLogs(enabled: boolean) {
    if (this._playerDebug) this._playerDebug.debugLogs = enabled;
  }
  pausePoses(pause: boolean) {
    this._player.poses.pause = pause;
  }

  setPlayerMixerTime(time: number) {
    if (time < 0) time = 0;
    this._player.actions.unPauseAllMoveActions();
    const scaledTime = time / this._player.mixer.timeScale;
    this._player.mixer.setTime(scaledTime * 60);
  }

  //private _lastImportTime = performance.now()
  public tick(delta: number) {
    this.importSettings();
  }

  private importSettings() {
    this._settings["mixer time [m]"] = this._player.mixer.time / 60;
    this._settings["mixer time [s]"] = this._player.mixer.time;
    this._player.actions.poseActions.forEach(({ animation, poseType }) => {
      this.copyActionStateToSettings(poseType, animation);
    });

    this.copyActionStateToSettings("position", this._positionAnimation);
    this.copyActionStateToSettings("rotation", this._rotateAnimation);
  }

  private copyActionStateToSettings(
    actionType: ActionTypes,
    animation: AnimationAction
  ) {
    this._actionSettings.enabled[actionType] = animation.enabled;
    this._actionSettings.paused[actionType] = animation.paused;
    this._actionSettings.weight[actionType] = animation.getEffectiveWeight();
    this._actionSettings.timeScale[actionType] =
      animation.getEffectiveTimeScale();
    this._actionSettings.time[actionType] = animation.time;
  }

  private syncMixer() {
    this._player.mixer.setTime(this._match.time);
  }

  private stopAllActions() {
    this._player.actions.stopAllMoveActions();
  }

  showModel(visibility: boolean) {
    this._model.visible = visibility;
  }

  showSkeleton(visibility: boolean) {
    this._skeleton.visible = visibility;
  }

  modifyTimeScale(speed: number) {
    this._playerDebug?.modifyTimeScale(speed);
  }

  playAllActions() {
    this._player.actions.playAllMoveActions();
  }

  private unPauseAllActions() {
    this._player.singleStepMode = false;
    this._player.actions.unPauseAllMoveActions();
  }

  private pauseAllActions() {
    this._player.actions.pauseAllMoveActions();
  }

  private toSingleStepMode() {
    this._player.actions.unPauseAllMoveActions();

    this._player.singleStepMode = true;
    this._player.sizeOfNextStep = this._settings["modify step size"];
  }

  switchPoseTo(poseType: PoseTypes) {
    const pose: PoseRecord = {
      step: 1,
      type: poseType,
      timeScale: 1,
      playerSpeed: 1,
      fadeTime: this.crossFadeDuration(0.1),
      rotation: 0,
      direction: 0
    };
    this._player.poses.switchPoseTo(
      pose,
      this._settings["with sync cross fade"]
    );
  }

  private crossFadeDuration(defaultDuration: number) {
    // Switch default crossfade duration <-> custom crossfade duration
    return this._settings["use default duration"]
      ? defaultDuration
      : this._settings["set custom duration"];
  }

  getAction(key: ActionTypes) {
    switch (key) {
      case "position":
        return this._positionAnimation;
      case "rotation":
        return this._rotateAnimation;
      default:
        return this._player.actions.getPoseAction(key).animation;
    }
  }
}
