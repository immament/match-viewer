import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  Object3D,
  SkeletonHelper,
  VectorKeyframeTrack
} from "three";
import { GLTF } from "three/addons";

import { logger } from "@/app/logger";
import { ModelConfig } from "./ModelConfig";
import { Player } from "./Player.model";
import { PlayerId } from "./PlayerId";
import { PlayerActions } from "./animations/PlayerActions";
import { isMovePoseType, PoseTypes } from "./animations/Pose.model";
import { PoseAction } from "./animations/PoseAction";
import { createMoveActions } from "./animations/movement";

export function setupPlayerModel(data: GLTF) {
  const model = data.scene;

  model.name = "PlayerRoot";

  // model.traverse(function (object: Object3D & { isMesh?: boolean }) {
  //   if (object.isMesh) object.castShadow = true;
  // });
  logger.trace("Player gltf:", data);
  return { model, animations: data.animations };
}

export function setupPlayer(
  playerId: PlayerId,
  model: Object3D,
  animationClips: AnimationClip[],
  modelConfig: ModelConfig
) {
  const skeleton = new SkeletonHelper(model);
  skeleton.visible = false;

  const { mixer, actions, poses } = setupPlayerAnimmations(
    playerId,
    model,
    animationClips,
    modelConfig
  );

  const player = new Player(playerId, model, skeleton, mixer, actions, poses);

  return { player };
}

function setupPlayerAnimmations(
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
      poseActions[posType] = createActionForType(
        posType,
        isMovePoseType(posType)
      );
    });
    return poseActions;
  }

  function createActionForType(poseType: PoseTypes, isMoveType: boolean) {
    const animationAction = createAction(
      modelConfig.animationClip(animationClips, poseType)
    );

    animationAction.setEffectiveWeight(0);
    animationAction.enabled = false;
    // animationAction.loop = LoopOnce;
    if (!isMoveType) {
      animationAction.play();
      animationAction.loop = LoopOnce;
      //action.clampWhenFinished = true;
      //action.play();
    } else {
      // animationAction.getClip().duration =
      //   animationAction.getClip().duration - 0.03333333507180211;
    }

    return new PoseAction(animationAction, isMoveType, poseType);
  }

  function createAction(clip: AnimationClip | undefined): AnimationAction {
    // if (clip) logger.debug("createAction", clip.name, clip.duration);
    return clip ? mixer.clipAction(clip.clone()) : emptyAction();
  }

  function emptyAction() {
    const kft = new VectorKeyframeTrack(".scale", [0], [1, 1, 1]);
    const clip = new AnimationClip("empty", 0, [kft]);
    return mixer.clipAction(clip);
  }
}
