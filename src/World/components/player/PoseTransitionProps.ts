import { PoseAction, PoseRecord } from "./animations/PoseAction";

export type PoseTransitionProps = {
  readonly oldAction: PoseAction | undefined;
  readonly newAction: PoseAction;
  readonly newPose: PoseRecord;
  readonly withSync: boolean;
  readonly transitionId: string;
  readonly mixterTime: number;
};
