import { round } from "@/app/utils";
import { PlayerId } from "../Player.model";
import { PoseTypes } from "./Pose.model";
import { PoseBuilderContext } from "./PoseBuilderContext";
import { PoseBuilderStep } from "./PoseBuilderStep";
import { PositionProxy } from "./PositionProxy";
import { distance2D, MATCH_TIME_SCALE, onOut } from "./positions";
import { RotationBuilder } from "./RotationBuilder";

const THROW_IN_BALL_MIN_HEIGHT = 1.6;
const HEAD_BALL_MIN_HEIGHT = 1.4;

export class PoseBuilder {
  constructor(
    private _playerId: PlayerId,
    private _rotationBuilder: RotationBuilder
  ) {}

  public calculatePose(context: PoseBuilderContext): void {
    if (context.step < 0) return;
    context.initPoseRecord(this.playerSpeed(context));
    this.createPose(context);
    this.poseReapeat(context);

    this._rotationBuilder.calculateDirection(context);
  }

  private poseReapeat(context: PoseBuilderContext) {
    if (context.step <= 0) return;
    if (context.prev.pose?.type === context.pose.type) {
      context.pose.iteration = (context.prev.pose.iteration ?? 0) + 1;
      if (context.pose.startFrom) {
        context.pose.startFrom += MATCH_TIME_SCALE;
      }
    }
  }

  private createPose(context: PoseBuilderContext): void {
    switch (context.rawPose) {
      case "p": // pass
      case "l": // pass
      case "o": // cross
        if (this.passType(context)) return;
        break;
      case "r": // shot
      case "v": // shot
        return this.isHead(context)
          ? this.useHeadPose(context)
          : this.useShotPose(context);
    }

    return this.createMovePose(context);
  }

  private passType(context: PoseBuilderContext): boolean {
    if (this.isThrowIn(context.ballPos)) {
      if (onOut(context.playerPos)) {
        //  && ballDistBeg < 0.7
        context.pose.type = PoseTypes.throwIn;
        context.pose.startFrom = 1;
        return true;
      }
      return false;
    }
    if (this.isHead(context)) this.useHeadPose(context);
    else this.usePassPose(context);
    return true;
  }

  private usePassPose(context: PoseBuilderContext) {
    context.pose.type = PoseTypes.pass;
    context.pose.startFrom = 0.3;
    this.movePlayerToBall(context);
  }

  private useHeadPose(context: PoseBuilderContext) {
    context.pose.type = PoseTypes.head;
    context.pose.startFrom = 1;
    this.movePlayerToBall(context);
  }

  private useShotPose(context: PoseBuilderContext): void {
    //logger.debug(this._playerId, "useShotPose", round(context.step / 120));
    context.pose.type = PoseTypes.shot;
    context.pose.timeScale = 1;
    context.pose.startFrom = 0.5;
    this.movePlayerToBall(context);
  }

  private isHead({
    ballPos,
    playerPos
  }: {
    ballPos: PositionProxy;
    playerPos: PositionProxy;
  }) {
    return (
      ballPos.y > HEAD_BALL_MIN_HEIGHT && ballPos.distanceTo(playerPos) < 1.5
    );
  }

  private movePlayerToBall(
    context: PoseBuilderContext,
    maxDistance = 0.5,
    finalDistance = 0.4
  ) {
    if (context.ballPos.distanceTo(context.playerPos) <= maxDistance) return;

    const { next } = context;
    context.playerPos.moveToPoint2(context.ballPos, finalDistance);
    next.playerPos.x = context.playerPos.x;
    next.playerPos.z = context.playerPos.z;

    this.updatePreviousPose(context);
  }

  private updatePreviousPose(context: PoseBuilderContext) {
    if (context.prev.rawPose) return;
    context.step--;
    this.calculatePose(context);
    context.step++;
  }

  private createMovePose(context: PoseBuilderContext): void {
    if (this.checkThrowIn(context)) return;
    const pose = context.pose;

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

  private checkThrowIn({ ballPos, playerPos, pose }: PoseBuilderStep): boolean {
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

  private playerSpeed(context: PoseBuilderContext): number {
    const deltaDist = context.playerPos.distanceTo(context.next.playerPos);
    const deltaTime = context.next.time - context.time;
    return deltaDist / deltaTime;
  }
}
