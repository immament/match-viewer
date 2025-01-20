import { PlayerId } from "../PlayerId";
import { PlayerDirectionBuilder } from "./PlayerDirectionBuilder";
import { PoseTypes } from "./Pose.model";
import { PoseBuilderContext } from "./PoseBuilderContext";
import { PositionProxy } from "./PositionProxy";
import { distance2D, MATCH_TIME_SCALE, onOut } from "./positions.utils";
import { round } from "/app/utils";

const THROW_IN_BALL_MIN_HEIGHT = 1.6;
const HEAD_BALL_MIN_HEIGHT = 1.4;

export class PoseBuilder {
  constructor(
    private _playerId: PlayerId,
    private ctx: PoseBuilderContext,
    private _directionBuilder: PlayerDirectionBuilder
  ) {}

  public calculatePose(): void {
    if (this.ctx.stepIdx < 0) return;
    this.ctx.initPoseRecord(this.playerSpeed());
    this.createPose();
    this.poseReapeat();

    this._directionBuilder.calculateDirection();
  }

  private poseReapeat() {
    if (this.ctx.stepIdx <= 0) return;
    if (this.ctx.prev.pose?.type === this.ctx.pose.type) {
      this.ctx.pose.iteration = (this.ctx.prev.pose.iteration ?? 0) + 1;
      if (this.ctx.pose.startFrom) {
        this.ctx.pose.startFrom += MATCH_TIME_SCALE;
      }
    }
  }

  private createPose(): void {
    switch (this.ctx.rawPose) {
      case "p": // pass
      case "l": // pass
      case "o": // cross
        if (this.passType()) return;
        break;
      case "r": // shot
      case "v": // shot
        return this.isHead() ? this.useHeadPose() : this.useShotPose();
    }

    return this.createMovePose();
  }

  /**
   * Determines the type of pass based on the current context and updates the pose accordingly.
   *
   * @returns {boolean} - Returns `true` if a valid pass type is determined, otherwise `false`.
   */
  private passType(): boolean {
    if (this.isThrowIn(this.ctx.ballPos)) {
      if (onOut(this.ctx.playerPos)) {
        //  && ballDistBeg < 0.7
        this.ctx.pose.type = PoseTypes.throwIn;
        this.ctx.pose.startFrom = 1;
        return true;
      }
      return false;
    }
    if (this.isHead()) this.useHeadPose();
    else this.usePassPose();
    return true;
  }

  private usePassPose() {
    this.ctx.pose.type = PoseTypes.pass;
    this.ctx.pose.startFrom = 0.3;
    this.movePlayerToBall();
  }

  private useHeadPose() {
    this.ctx.pose.type = PoseTypes.head;
    this.ctx.pose.startFrom = 1;
    this.movePlayerToBall();
  }

  private useShotPose(): void {
    //logger.debug(this._playerId, "useShotPose", round(context.step / 120));
    this.ctx.pose.type = PoseTypes.shot;
    this.ctx.pose.timeScale = 1;
    this.ctx.pose.startFrom = 0.5;
    this.movePlayerToBall();
  }

  private isHead() {
    return (
      this.ctx.ballPos.y > HEAD_BALL_MIN_HEIGHT && this.distanceToBall() < 1.5
    );
  }

  private distanceToBall() {
    return this.ctx.playerPos.distanceTo(this.ctx.ballPos);
  }

  private movePlayerToBall(maxDistance = 0.5, finalDistance = 0.4) {
    if (this.ctx.playerPos.distanceTo(this.ctx.ballPos) <= maxDistance) return;

    const { next } = this.ctx;
    this.ctx.playerPos.moveToPointAtDistance(this.ctx.ballPos, finalDistance);
    next.playerPos.x = this.ctx.playerPos.x;
    next.playerPos.z = this.ctx.playerPos.z;

    this.updatePreviousPose();
  }

  private updatePreviousPose() {
    if (this.ctx.prev.rawPose) return;
    this.ctx.stepIdx--;
    this.calculatePose();
    this.ctx.stepIdx++;
  }

  private createMovePose(): void {
    if (this.checkThrowIn()) return;
    const pose = this.ctx.pose;

    if (pose.playerSpeed > 1.5) {
      pose.type = PoseTypes.run;
      pose.timeScale = this.runTimeScale(pose.playerSpeed);
      return;
    }

    if (pose.playerSpeed > 0.05) {
      pose.type = PoseTypes.walk;
      pose.timeScale = this.walkTimeScale(pose.playerSpeed);
      return;
    }
  }

  private runTimeScale(playerSpeed: number) {
    return round(Math.min(1, playerSpeed + 0.5 / 6));
  }

  private walkTimeScale(playerSpeed: number) {
    return Math.min(1, round((playerSpeed * 2 + 0.5) / 4));
  }

  private checkThrowIn(): boolean {
    const { ballPos, playerPos, pose } = this.ctx;
    if (this.isThrowIn(ballPos)) {
      if (onOut(playerPos))
        if (distance2D(playerPos, ballPos) < 0.7) {
          pose.type = PoseTypes.throwIn;
          pose.startFrom = 1;
          pose.timeScale = 0.04;
          return true;
        }
    }
    return false;
  }

  private isThrowIn(ballPos: PositionProxy) {
    return onOut(ballPos) && ballPos.y > THROW_IN_BALL_MIN_HEIGHT;
  }

  private playerSpeed(): number {
    const deltaDist = this.ctx.playerPos.distanceTo(this.ctx.next.playerPos);
    const deltaTime = this.ctx.next.time - this.ctx.time;
    return deltaDist / deltaTime;
  }
}
