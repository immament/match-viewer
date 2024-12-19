import { PlayerId } from "../Player.model";
import { PoseRecord, RawPoseEvents, Writeable } from "./Pose.model";
import { PoseBuilderStep } from "./PoseBuilderStep";
import { BallPositionProxy, PlayerPositionProxy } from "./PositionProxy";
import { BallPositionsConfig } from "./positions";

export class PoseBuilderContext extends PoseBuilderStep {
  private _prev: PoseBuilderStep;
  private _next: PoseBuilderStep;

  public get prev(): PoseBuilderStep {
    return this._prev;
  }
  public get current(): PoseBuilderStep {
    return this;
  }
  public get next(): PoseBuilderStep {
    return this._next;
  }

  get step(): number {
    return super.step;
  }

  set step(value: number) {
    this._prev.step = value - 1;
    super.step = value;
    this._next.step = value + 1;
  }

  constructor(
    playerId: PlayerId,
    playerPositions: Float32Array,
    ballPositions: BallPositionsConfig,
    times: Float32Array,
    rawPoses: RawPoseEvents
  ) {
    super(
      new PlayerPositionProxy(playerPositions, playerId),
      new BallPositionProxy(ballPositions, playerId),
      times,
      rawPoses
    );
    this._prev = createStep(this.posesResult);
    this._next = createStep(this.posesResult);

    function createStep(posesResult: Writeable<PoseRecord>[]) {
      return PoseBuilderStep.create(
        playerPositions,
        ballPositions,
        times,
        rawPoses,
        posesResult,
        playerId
      );
    }
  }

  public getPosesResult(): PoseRecord[] {
    this.fixLastPose();
    return this.posesResult;
  }

  getRotationResult() {
    this.fixLastRotation(this.rotateValues, 4);
    return this.rotateValues;
  }

  // if last position is undefined pose is copied from previouse position
  private fixLastPose() {
    if (!this.posesResult[this.posesResult.length - 1]) {
      this.posesResult[this.posesResult.length - 1] = {
        ...this.posesResult[this.posesResult.length - 2],
        step: this.posesResult.length - 1
      };
    }
  }
  private fixLastRotation(rotations: number[], count: number) {
    for (let i = rotations.length - count; i < rotations.length; i++) {
      rotations[i] = rotations[i - count];
    }
  }
}
