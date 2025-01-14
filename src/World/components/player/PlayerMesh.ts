import { AnimationMixer, Group, Object3D, Object3DEventMap } from "three";
import { PlayerActions } from "./animations/PlayerActions";
import { PlayerPoses } from "./animations/PlayerPoses";
import { PoseRecord } from "./animations/PoseAction.model";
import { PlayerId } from "./PlayerId";
import { logger } from "/app/logger";

export type Player3D = Object3D<Object3DEventMap>;

// Player mesh/object
export class PlayerMesh extends Group {
  // TODO: debug props
  public debug_singleStepMode: boolean = false;
  public debug_sizeOfNextStep: number = 0;

  private _poses: PlayerPoses;
  public get poses(): PlayerPoses {
    return this._poses;
  }

  public get model(): Player3D {
    return this._model;
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
    private _mixer: AnimationMixer,
    private _actions: PlayerActions,
    aPoses: PoseRecord[]
  ) {
    super();
    this._playerId = { ...aPlayerId };
    this.add(_model);
    this.name = "PlayerModel";

    // this._mixer.addEventListener("finished", (e) => {
    //   if (e.action === _actions.positionAction) {
    //     //_actions.pauseAllMoveActions();
    //   }
    // });

    this._poses = new PlayerPoses(this, this._mixer, this._actions, aPoses);
  }

  public tick(delta: number) {
    let mixerUpdateDelta = delta;
    if (this.debug_singleStepMode) {
      mixerUpdateDelta = this.debug_sizeOfNextStep;
      this.debug_sizeOfNextStep = 0;
    }

    this._poses.updatePose(mixerUpdateDelta);
    this._mixer.update(mixerUpdateDelta);
  }

  debugInfo() {
    logger.debug("debugInfo - player:", this);
    return "todo";
  }

  isPlayer({ teamIdx, playerIdx }: PlayerId) {
    return this.teamIdx === teamIdx && this.playerIdx === playerIdx;
  }
}
