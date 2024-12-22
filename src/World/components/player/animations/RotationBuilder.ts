import { MathUtils } from "three";
import { PoseTypes, Writeable } from "./Pose.model";
import { PoseRecord } from "./PoseAction";
import { PoseBuilderContext } from "./PoseBuilderContext";
import { rotation } from "./positions";

const TURN_MIN_ANGLE = MathUtils.degToRad(15);
export class RotationBuilder {
  constructor() {}

  public calculateDirection(ctx: PoseBuilderContext): void {
    const { next, pose, prev } = ctx;
    let direction: number;
    switch (pose.type) {
      case PoseTypes.pass:
      case PoseTypes.shot:
      case PoseTypes.head:
        direction = ctx.playerPos.direction2D(ctx.ballPos);
        break;
      case PoseTypes.idle:
        direction = ctx.playerPos.direction2D(ctx.ballPos);
        break;
      case PoseTypes.throwIn:
        direction = next.playerPos.direction2DRaw(next.playerPos.x, 0);
        break;
      case PoseTypes.walk:
      case PoseTypes.run:
        if (pose.playerSpeed < 3) {
          direction = this.syncWithBall(ctx);
        } else {
          direction = ctx.playerPos.direction2D(next.playerPos);
        }
        break;

      default:
        direction = ctx.playerPos.direction2D(next.playerPos);
        break;
    }
    pose.direction = direction;
    if (prev.pose) {
      pose.lastDirection = prev.pose.direction;
      pose.rotation = rotation(pose.lastDirection, pose.direction);
    }
    this.tryUseTurnPose(pose);
    ctx.savePlayerDirection(direction);
  }

  private syncWithBall(ctx: PoseBuilderContext) {
    const { next, pose } = ctx;
    let moveDir = ctx.playerPos.direction2D(next.playerPos);
    const dirToBall = ctx.playerPos.direction2D(ctx.ballPos);
    const moveToLookAngle = rotation(moveDir, dirToBall);
    if (Math.abs(moveToLookAngle) > MathUtils.degToRad(120)) {
      pose.type = pose.playerSpeed < 1 ? PoseTypes.walkBack : PoseTypes.jogBack;
      moveDir = dirToBall;
    } else if (moveToLookAngle > MathUtils.degToRad(60)) {
      pose.type = PoseTypes.jogLeft;
      moveDir = dirToBall;
    } else if (moveToLookAngle < MathUtils.degToRad(-60)) {
      pose.type = PoseTypes.jogRight;
      moveDir = dirToBall;
    }
    return moveDir;
  }

  private tryUseTurnPose(pose: Writeable<PoseRecord>) {
    if (
      pose.type === PoseTypes.idle
      //       || (poseRecord.type === PoseTypes.walk && poseRecord.playerSpeed < 0.4)
    ) {
      if (pose.rotation < -TURN_MIN_ANGLE) {
        pose.type = PoseTypes.leftTurn;
        pose.timeScale = 1;
      } else if (pose.rotation > TURN_MIN_ANGLE) {
        pose.type = PoseTypes.rightTurn;
        pose.timeScale = 1;
      }
    }
  }
}
