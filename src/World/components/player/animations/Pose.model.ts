import { PoseAction } from "./PoseAction";

export enum PoseTypes {
  tPose = "tPose",
  idle = "idle",
  walk = "walk",
  run = "run",
  pass = "pass",
  head = "head",
  shot = "shot",
  throwIn = "throwIn",
  leftTurn = "leftTurn",
  rightTurn = "rightTurn",
  jogBack = "jogBack",
  walkBack = "walkBack",
  jogLeft = "jogLeft",
  jogRight = "jogRight"
}

const movePoseTypes = [
  PoseTypes.idle,
  PoseTypes.walk,
  PoseTypes.run,
  PoseTypes.leftTurn,
  PoseTypes.rightTurn,
  PoseTypes.walkBack,
  PoseTypes.jogBack,
  PoseTypes.jogLeft,
  PoseTypes.jogRight
];

export function isMovePoseType(poseType: PoseTypes) {
  return movePoseTypes.includes(poseType);
}

// l: long pass, p: pass, v: shot, w: shot
export type RawPoseTypes = "l" | "p" | "o" | "r" | "v" | "w";
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type PoseRecord = {
  readonly type: PoseTypes;
  readonly timeScale: number;
  readonly playerSpeed: number;
  readonly step: number;
  readonly startFrom?: number;
  readonly fadeTime?: number;
  readonly lockTime?: number;
  readonly iteration?: number;
  readonly rawPose?: string;
  readonly direction: number;
  readonly lastDirection?: number;
  // radions
  readonly rotation: number;
  action?: PoseAction;
};

export type RawPoseEvents = Record<number, RawPoseTypes | undefined>;
