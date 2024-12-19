import { Vector2, Vector3 } from "three";
import { PlayerId } from "../Player.model";
import { BallPositionsConfig, distance2D, Point2, Point3 } from "./positions";

export abstract class PositionProxy implements Point3 {
  private _step = 0;
  protected _vector3 = new Vector3();

  constructor() {
    //this.step = 0;
  }

  public get step(): number {
    return this._step;
  }
  public set step(value: number) {
    this._step = value;
  }

  get x(): number {
    return this._vector3.x;
  }
  set x(value: number) {
    this._vector3.x = value;
    this.xChanged(value);
  }
  get y() {
    return this._vector3.y;
  }
  set y(value: number) {
    this._vector3.y = value;
    this.yChanged(value);
  }
  get z() {
    return this._vector3.z;
  }
  set z(value: number) {
    this._vector3.z = value;
    this.zChanged(value);
  }

  protected abstract xChanged(value: number): void;
  protected abstract yChanged(value: number): void;
  protected abstract zChanged(value: number): void;

  copyToVector3(v: Vector3): Vector3 {
    return v.copy(this._vector3);
  }
  copyToVector2(v: Vector2): Vector2 {
    return v.set(this.x, this.z);
  }

  distanceTo(v: Point3): number {
    return distance2D(this, v);
  }
  toString() {
    return `{x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
  }

  private _tmp_dir = new Vector2();
  private _tmp_begin = new Vector2();
  private _tmp_end = new Vector2();

  moveToPoint2(target: Point2, distance: number) {
    this.copyToVector2(this._tmp_begin);
    this._tmp_end.set(target.x, target.z);

    this._tmp_dir.subVectors(this._tmp_begin, this._tmp_end).normalize();

    this._tmp_end.addScaledVector(this._tmp_dir, distance);

    this.x = this._tmp_end.x;
    this.z = this._tmp_end.y;
  }

  direction2D(end: Point2) {
    return Math.atan2(end.x - this.x, end.z - this.z);
  }
  direction2DRaw(xEnd: number, zEnd: number) {
    return Math.atan2(xEnd - this.x, zEnd - this.z);
  }
}

export class PlayerPositionProxy extends PositionProxy {
  constructor(private _positions: Float32Array, private _playerId: PlayerId) {
    super();
    super.step = 0;
  }

  public set step(value: number) {
    super.step = value;
    this._vector3.fromArray(this._positions, value * 3);
  }
  protected xChanged(value: number) {
    // playerLogger.debug(
    //   this._playerId,
    //   super.step,
    //   "xChanged:",
    //   this,
    //   `${this._vector3.x} => ${value}`,
    //   this._positions[super.step * 3]
    // );
    this._positions[super.step * 3] = value;
  }
  protected yChanged(value: number) {
    this._positions[super.step * 3 + 1] = value;
  }
  protected zChanged(value: number) {
    this._positions[super.step * 3 + 2] = value;
  }
}

export class BallPositionProxy extends PositionProxy {
  constructor(
    private _positions: BallPositionsConfig,
    private _playerId: PlayerId
  ) {
    super();
    super.step = 0;
  }

  public set step(aStep: number) {
    super.step = aStep;
    this._vector3.set(
      this._positions.px[aStep],
      this._positions.pHeight[aStep],
      this._positions.pz[aStep]
    );
    // if (aStep < 4) {
    //   playerLogger.debug(
    //     this._playerId,
    //     aStep,
    //     "set step",

    //     this._vector3.x,
    //     this._vector3.y,
    //     this._vector3.z,
    //     this.z,
    //     this._positions.pz[aStep]
    //   );
    // }
  }

  protected xChanged(value: number) {
    this._positions.px[super.step] = value;
  }
  protected yChanged(value: number) {
    this._positions.pHeight[super.step] = value;
  }
  protected zChanged(value: number) {
    this._positions.pz[super.step] = value;
  }
}
