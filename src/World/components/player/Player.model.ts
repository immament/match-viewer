import {
  AnimationMixer,
  Group,
  Object3D,
  Object3DEventMap,
  SkeletonHelper
} from "three";

import { logger } from "@/app/logger";
import { PlayerActions } from "./animations/PlayerActions";
import { PoseRecord } from "./animations/Pose.model";
import { PlayerDebug } from "./PlayerDebug";
import { PlayerPoses } from "./PlayerPoses";

export type Player3D = Object3D<Object3DEventMap>;
export class Player extends Group {
  public singleStepMode: boolean = false;
  public sizeOfNextStep: number = 0;

  private _poses: PlayerPoses;
  public get poses(): PlayerPoses {
    return this._poses;
  }
  private _debug: PlayerDebug;
  public get debug(): PlayerDebug {
    return this._debug;
  }

  public get model(): Player3D {
    return this._model;
  }
  public get skeleton(): SkeletonHelper {
    return this._skeleton;
  }

  public get mixer(): AnimationMixer {
    return this._mixer;
  }
  public get actions(): PlayerActions {
    return this._actions;
  }

  public get teamIdx(): number {
    return this._playerId.teamIdx;
  }
  public get playerIdx(): number {
    return this._playerId.playerIdx;
  }
  private readonly _playerId: PlayerId;

  constructor(
    aPlayerId: PlayerId,
    private _model: Player3D,
    private _skeleton: SkeletonHelper,
    private _mixer: AnimationMixer,
    private _actions: PlayerActions,
    aPoses: PoseRecord[]
  ) {
    super();
    this._playerId = { ...aPlayerId };
    this.add(_model);
    this.name = "PlayerModel";

    this._mixer.addEventListener("finished", (e) => {
      if (e.action === _actions.positionAction) {
        //_actions.pauseAllMoveActions();
      }
    });

    this._poses = new PlayerPoses(this, this._mixer, this._actions, aPoses);

    this._debug = new PlayerDebug(this);
  }

  public tick(delta: number) {
    let mixerUpdateDelta = delta;
    if (this.singleStepMode) {
      mixerUpdateDelta = this.sizeOfNextStep;
      this.sizeOfNextStep = 0;
    }

    this._poses.updatePose(mixerUpdateDelta);
    this._mixer.update(mixerUpdateDelta);
  }

  // public forceUpdatePose() {
  //   this._poses.forceUpdatePose();
  // }

  // public pausePoses(pause: boolean) {
  //   this._poses.pause = pause;
  // }

  debugInfo() {
    logger.debug("debugInfo - player:", this);
    return "todo";
    // return `[${this.teamIdx}/${this.playerIdx}]
    //   last action: ${this._lastAction?.name ?? "-"},
    //   last pose: ${this._lastPose?.type ?? "-"}`;
  }

  isPlayer({ teamIdx, playerIdx }: PlayerId) {
    return this.teamIdx === teamIdx && this.playerIdx === playerIdx;
  }

  // public switchPoseTo(newPose: PoseRecord, withSync: boolean) {
  //   this._poses.switchPoseTo(newPose, withSync);
  // }

  // ### DEBUG
  debug_modifyTimeScale(speed: number) {
    this._mixer.timeScale = speed;
  }
}

export interface PlayerId {
  readonly teamIdx: number;
  readonly playerIdx: number;
}
