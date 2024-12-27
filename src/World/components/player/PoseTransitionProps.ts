import { PoseAction, PoseRecord } from "./animations/PoseAction";

export type PoseTransitionProps = {
  readonly oldPoseAction: PoseAction | undefined;
  readonly newPoseAction: PoseAction;
  readonly newPoseRecord: PoseRecord;
  readonly withSync: boolean;
  readonly transitionId: string;
  readonly mixterTime: number;
};
