import {
  AnimationAction,
  AnimationMixer,
  Event,
  Object3D,
  Vector3
} from "three";

import { playerLogger } from "../../../components/player/player.logger";
import { IUpdatable } from "../../../systems/Loop";
import { Label } from "../../match/Label";
import { PoseRecord } from "../animations/PoseAction.model";
import { PoseAnimationAction } from "../animations/PoseAnimationAction";
import { ILabelUpdater } from "../ILabelUpdater";
import { PlayerMesh } from "../PlayerMesh";
import { round } from "/app/utils";

export type PlayerDebugLabelsConfig = {
  visible: boolean;
  position: boolean;
  mixerTime: boolean;
  poseTime: boolean;
  speed: boolean;
  rotation: boolean;
};

export type PlayerDebugConfig = {
  labels: PlayerDebugLabelsConfig;
};

export class PlayerDebug implements ILabelUpdater, IUpdatable {
  private _loopListeners = true;
  public get player(): PlayerMesh {
    return this._player;
  }

  private _isActive = false;
  public get isActive() {
    return this._isActive;
  }
  public set isActive(value) {
    playerLogger.trace(this._player, "set isActive:", value);
    this._isActive = value;

    if (value && this._loopListeners) {
      this.player.mixer.addEventListener("finished", this._onActionFinished);
      this.player.mixer.addEventListener("loop", this._onActionLoop);
    } else {
      this.player.mixer.removeEventListener("finished", this._onActionFinished);
      this.player.mixer.removeEventListener("loop", this._onActionLoop);
    }
  }

  private _onActionFinished = this.onActionFinished.bind(this);
  private _onActionLoop = this.onActionLoop.bind(this);

  public onActionLoop({
    action,
    loopDelta,
    target
  }: {
    action: AnimationAction;
    loopDelta: number;
  } & Event<"loop", AnimationMixer>) {
    if (!this.debugLogs || !(action instanceof PoseAnimationAction)) return;

    playerLogger.debug(
      this._player,
      "dbg: {end loop}:",
      action.getClip().name,
      {
        poseRecord: action.poseRecord,
        aTime: action.time,
        mTime: round(target.time / 60, 3),
        loopDelta,
        enabled: action.enabled,
        isRunning: action.isRunning(),
        paused: action.paused
      }
    );
  }

  private onActionFinished({
    action,
    direction,
    target
  }: { action: AnimationAction; direction: number } & Event<
    "finished",
    AnimationMixer
  >) {
    if (!this.debugLogs || !(action instanceof PoseAnimationAction)) return;

    playerLogger.debug(
      this._player,
      "dbg: {Finished action}:",
      action.getClip().name,
      {
        poseRecord: action.poseRecord,
        aTime: action.time,
        mTime: round(target.time / 60),
        direction,
        enabled: action.enabled,
        isRunning: action.isRunning(),
        paused: action.paused
      },
      action
    );
  }

  public debugPlay = false;
  public debugLogs = false;

  private label?: Label;

  private _config: PlayerDebugConfig = {
    labels: {
      visible: false,
      position: false,
      mixerTime: false,
      poseTime: false,
      speed: false,
      rotation: false
    }
  };

  public get config() {
    return this._config;
  }

  constructor(private _player: PlayerMesh) {
    this.addLabel(_player.model);
  }
  private _nextTickTime: number = performance.now();
  tick(delta: number, realDelta?: number): void {
    if (!delta) {
      if (this.debugPlay && realDelta) this._player.tick(realDelta);
      return;
    }

    const now = performance.now();
    if (this._nextTickTime > now) return;

    this.updateLabel(
      this.createLabelText(
        this._player.poses.currentPose,
        this.player.mixer.time
      )
    );
    this._nextTickTime = now + 500;
  }

  createLabelText(
    pose: PoseRecord | undefined,
    mixerTime: number
  ): string | undefined {
    const { labels } = this._config;
    if (!labels.visible) return undefined;

    let text = `${this._player.playerIdx}. ${pose?.type ?? "-"}`;
    if (labels.mixerTime) {
      text += ` t:${round(mixerTime)}`;
    }
    if (labels.poseTime && pose?.action) {
      text += ` [${round(pose.action.time)}]`;
    }

    if (labels.position) {
      text += ` (${round(this._player.model.position.x, 1)},
        ${round(this._player.model.position.z, 1)})`;
    }

    if (pose) {
      if (labels.speed) {
        text += ` sp:${round(pose.playerSpeed, 1)}`;
      }
      if (labels.rotation) {
        text += ` r:${round(pose.rotation, 1)} a:${round(pose.direction, 1)}`;
      }
    }

    return text;
  }

  updateLabel(text: string | undefined = ""): void {
    if (this.label) this.label.setText(text);
  }

  private addLabel(model: Object3D) {
    this.label = new Label({
      position: new Vector3(0, 2.2, 0),
      text: `${this._player.teamIdx},${this._player.playerIdx}`,
      layerIdx: 1
    });

    this.label.addTo(model);
  }

  modifyTimeScale(speed: number) {
    this.player.mixer.timeScale = speed;
  }
}
