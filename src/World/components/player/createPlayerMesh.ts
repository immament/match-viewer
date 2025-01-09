import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  Object3D,
  VectorKeyframeTrack
} from "three";

import { ModelConfig } from "./ModelConfig";
import { PlayerId } from "./PlayerId";
import { PlayerMesh } from "./PlayerMesh";
import { PlayerActions } from "./animations/PlayerActions";
import { isMovePoseType, PoseTypes } from "./animations/Pose.model";
import { PoseAction } from "./animations/PoseAction.model";
import { PoseAction2 } from "./animations/PoseAction2";
import { PoseAnimationAction } from "./animations/PoseAnimationAction";
import { createMoveActions } from "./animations/actions.factory";

export function createPlayerMesh(
  playerId: PlayerId,
  model: Object3D,
  animationClips: AnimationClip[],
  modelConfig: ModelConfig
) {
  const { mixer, actions, poses } = setupPlayerAnimations(
    playerId,
    model,
    animationClips,
    modelConfig
  );

  const player = new PlayerMesh(playerId, model, mixer, actions, poses);

  return { player };
}

function setupPlayerAnimations(
  playerId: PlayerId,
  model: Object3D,
  animationClips: AnimationClip[],
  modelConfig: ModelConfig
) {
  const mixer = new AnimationMixer(model);

  const { rotateAction, positionAction, poses } = createMoveActions(
    mixer,
    playerId
  );

  const poseActions = createPoseActions();

  const actions = new PlayerActions(
    positionAction,
    rotateAction,
    poseActions,
    playerId
  );

  return { mixer, actions, poses };

  // internal
  function createPoseActions() {
    const poseActions = {} as Record<PoseTypes, PoseAction>;

    Object.keys(PoseTypes).forEach((key) => {
      const posType = key as PoseTypes;
      poseActions[posType] = createPoseActionForType(
        playerId,
        posType,
        isMovePoseType(posType)
      );
    });
    return poseActions;
  }

  function createPoseActionForType(
    playerId: PlayerId,
    poseType: PoseTypes,
    isMoveType: boolean
  ): PoseAction {
    const clip =
      modelConfig.animationClip(animationClips, poseType)?.clone() ??
      emptyClip();

    const { poseAction, animationAction } = createPoseActionWithAnimation(
      "PoseAction2",
      playerId,
      poseType,
      isMoveType,
      clip
    );

    animationAction.setEffectiveWeight(0);
    animationAction.enabled = false;

    if (!isMoveType) {
      animationAction.play();
      animationAction.loop = LoopOnce;
    }

    return poseAction;
  }

  function createPoseActionWithAnimation(
    poseImplType: "PoseAnimationAction" | "PoseAction2",
    playerId: PlayerId,
    poseType: PoseTypes,
    isMoveType: boolean,
    clip: AnimationClip
  ) {
    let poseAction: PoseAction;
    let animationAction: AnimationAction;
    switch (poseImplType) {
      case "PoseAnimationAction":
        poseAction = animationAction = new PoseAnimationAction(
          isMoveType,
          poseType,
          playerId,
          mixer,
          clip,
          mixer.getRoot() as Object3D,
          clip.blendMode
        );
        break;

      default:
        animationAction = mixer.clipAction(clip);
        poseAction = new PoseAction2(
          isMoveType,
          poseType,
          playerId,
          animationAction
        );
        break;
    }
    return { poseAction, animationAction };
  }

  function emptyClip() {
    const kft = new VectorKeyframeTrack(".scale", [0], [1, 1, 1]);
    return new AnimationClip("empty", 0, [kft]);
  }
}
