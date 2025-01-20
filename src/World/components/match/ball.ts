import {
  AnimationAction,
  AnimationMixer,
  Material,
  Mesh,
  SphereGeometry,
  Vector3
} from "three";
import { IUpdatable } from "../../systems/Loop";

export class Ball extends Mesh<SphereGeometry, Material> implements IUpdatable {
  private _mixer?: AnimationMixer | undefined;
  private _action?: AnimationAction | undefined;

  public get mixer(): AnimationMixer {
    if (!this._mixer) throw new Error("Ball mixer not set!");
    return this._mixer;
  }
  public get action(): AnimationAction {
    if (!this._action) throw new Error("Ball action not set!");
    return this._action;
  }

  constructor(geometry?: SphereGeometry, material?: Material) {
    super(geometry, material);
    this.name = "Ball";
  }

  // private radiansPerSecond = MathUtils.degToRad(30);

  private _prevPosition = new Vector3(0, 0, 0);
  private _prevDelta = 0;

  tick(delta: number): void {
    this._mixer?.update(delta);

    if (this._prevDelta !== 0) {
      // ball rotation (calculated for previous movement)
      this.rotation.x +=
        (this.position.z - this._prevPosition.z) * 60 * this._prevDelta;
      this.rotation.z +=
        (this._prevPosition.x - this.position.x) * 60 * this._prevDelta;
      this._prevPosition.copy(this.position);
    }
    this._prevDelta = delta;
  }

  setMixer(aMixer: AnimationMixer, anAction: AnimationAction) {
    this._mixer = aMixer;
    this._action = anAction;
  }
}
