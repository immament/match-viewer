import { Quaternion, Vector3 } from "three";
import { PlayerId } from "../Player.model";
import { PoseRecord, PoseTypes, RawPoseEvents, Writeable } from "./Pose.model";
import {
  BallPositionProxy,
  PlayerPositionProxy,
  PositionProxy
} from "./PositionProxy";
import { BallPositionsConfig } from "./positions";

export class PoseBuilderStep {
  private _posesResult: Writeable<PoseRecord>[];
  protected get posesResult(): Writeable<PoseRecord>[] {
    return this._posesResult;
  }

  private _rotateValues: number[];
  protected get rotateValues(): number[] {
    return this._rotateValues;
  }

  public get ballPos(): PositionProxy {
    return this._ballPos;
  }
  public get playerPos(): PositionProxy {
    return this._playerPos;
  }
  private _step: number = 0;
  public get step(): number {
    return this._step;
  }
  public set step(value: number) {
    this._step = value;
    this._playerPos.step = value;
    this._ballPos.step = value;
  }

  get pose() {
    return this._posesResult[this.step];
  }
  get time() {
    return this._times[this.step];
  }
  get rawPose() {
    return this._rawPoses[this.step];
  }

  constructor(
    private _playerPos: PositionProxy,
    private _ballPos: PositionProxy,
    private _times: Float32Array,
    private _rawPoses: RawPoseEvents
  ) {
    this._posesResult = Array(_times.length);
    this._rotateValues = Array<number>(_times.length * 4);
  }

  initPoseRecord(playerSpeed: number) {
    return (this._posesResult[this.step] = {
      type: PoseTypes.idle,
      step: this.step,
      timeScale: 1,
      playerSpeed,
      iteration: 0,
      rawPose: this.rawPose,
      direction: 0,
      rotation: 0
    });
  }

  private _tmp_quaternion = new Quaternion();
  private _defaultAxis = new Vector3(0, 1, 0);
  savePlayerDirection(direction: number) {
    this._tmp_quaternion.setFromAxisAngle(this._defaultAxis, direction);
    this._tmp_quaternion.toArray(this.rotateValues, this.step * 4);
  }

  static create(
    playerPositions: Float32Array,
    ballPositions: BallPositionsConfig,
    times: Float32Array,
    rawPoses: RawPoseEvents,
    posesResult: PoseRecord[],
    playerId: PlayerId
  ): PoseBuilderStep {
    return new PoseBuilderStep(
      new PlayerPositionProxy(playerPositions, playerId),
      new BallPositionProxy(ballPositions, playerId),
      times,
      rawPoses
    );
  }
}
