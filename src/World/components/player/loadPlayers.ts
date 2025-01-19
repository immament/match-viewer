import {
  BufferGeometry,
  MeshStandardMaterial,
  NormalBufferAttributes,
  Object3D,
  SkinnedMesh
} from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationNames, ModelConfig } from "./ModelConfig";
import { PlayerMesh } from "./PlayerMesh";
import { createPlayerMesh } from "./createPlayerMesh";
import { logger } from "/app/logger";

type ModelType = "player";
const MODEL_TYPE: ModelType = "player";

export async function loadPlayers(): Promise<{ players: PlayerMesh[] }> {
  const modelConfig = modelConfigFactory(MODEL_TYPE);

  const loader = new GLTFLoader();
  let characterData: GLTF;
  try {
    logger.info("before load player GLTF");
    characterData = await loader.loadAsync(modelConfig.modelPath);
  } catch (error) {
    logger.error(
      "Exception during model loading: " + modelConfig.modelPath,
      error
    );
    throw error;
  }

  const { model: baseModel, animations } = extractPlayerModel(characterData);
  logger.info("animations:", animations, ", baseModel:", baseModel);

  const players: PlayerMesh[] = [];

  type DefaultMesh = SkinnedMesh<
    BufferGeometry<NormalBufferAttributes>,
    MeshStandardMaterial
  >;

  const shirt = baseModel.getObjectByName("Ch38_Shirt") as DefaultMesh;
  for (let teamIdx = 0; teamIdx <= 1; teamIdx++) {
    let shirtMaterial: MeshStandardMaterial;
    let shortsMaterial: MeshStandardMaterial;

    if (teamIdx === 0) {
      shirtMaterial = shirt.material.clone();
      shirtMaterial.color.set(1, 1, 0);

      shortsMaterial = shirt.material.clone();
      shortsMaterial.color.set(0, 0, 1);

      // shirtMaterial = new MeshStandardMaterial({ color: "orange" });
      // shortsMaterial = new MeshStandardMaterial({ color: "blue" });
    } else {
      shirtMaterial = shirt.material.clone();
      shirtMaterial.color.set(2, 0, 0);
      //shirtMaterial = new MeshStandardMaterial({ color: "red" });
    }

    for (let playerIdx = 0; playerIdx < 11; playerIdx++) {
      const playerModel = SkeletonUtils.clone(baseModel);
      playerModel.userData = { teamIdx, playerIdx };

      const mesh = getMesh(playerModel);
      colorize(mesh);
      const { player } = createPlayerMesh(
        { teamIdx, playerIdx },
        playerModel,
        animations,
        modelConfig
      );

      players.push(player);
    }

    function colorize(mesh: SkinnedMesh) {
      if (shirtMaterial) {
        const shirt = mesh.getObjectByName("Ch38_Shirt") as DefaultMesh;
        if (shirt) {
          shirt.material = shirtMaterial;
        }
        // socks color == short
        const socks = mesh.getObjectByName("Ch38_Socks") as DefaultMesh;
        if (socks) {
          socks.material = shirtMaterial;
        }
      }
      if (shortsMaterial) {
        const shorts = mesh.getObjectByName("Ch38_Shorts") as DefaultMesh;
        if (shorts) {
          shorts.material = shortsMaterial;
        }
        // shoes color == shorts
        const shoes = mesh.getObjectByName("Ch38_Shoes") as DefaultMesh;
        if (shoes) {
          shoes.material = shortsMaterial;
        }
      }
      const body = mesh.getObjectByName("Ch38_Body") as DefaultMesh;
      body.material.metalness = 0.1;
    }
  }

  return { players: players };

  function getMesh(model: Object3D) {
    const result = modelConfig.getMeshFn(model);

    if (!result) throw new Error("Mesh not find");

    return result as DefaultMesh;
  }
}

function extractPlayerModel(data: GLTF) {
  const model = data.scene;

  model.name = "PlayerRoot";

  // model.traverse(function (object: Object3D & { isMesh?: boolean }) {
  //   if (object.isMesh) object.castShadow = true;
  // });
  logger.trace("Player gltf:", data);
  return { model, animations: data.animations };
}

function modelConfigFactory(modelType: ModelType): ModelConfig {
  switch (modelType) {
    case "player": {
      const animations: AnimationNames = {
        tPose: "pl.t_pose",
        idle: "sk.idle.anim",
        walk: "sk.walking.anim",
        run: "sk.jog_forward",
        pass: "sk.soccer_pass.anim",
        shot: "sk.strike_forward_jog.anim",
        head: "sk.soccer_header.anim",
        throwIn: "sk.throw_in.anim",
        leftTurn: "sk.left_turn.anim",
        rightTurn: "sk.right_turn.anim",
        jogBack: "sk.jog_backward.anim",
        walkBack: "sk.walking_backward.anim",
        jogLeft: "sk.jog_strafe_left.anim",
        jogRight: "sk.jog_strafe_right.anim"
      };
      return new ModelConfig(
        "assets/models/player/player.gltf",
        (m) => m.getObjectByName("Player"),
        undefined,
        animations

        //{ tPose: 0, idle: 1, walk: 8, run: 2, pass: 6, shot: 6, head: 4, throwIn: 7 }
      );
    }
    default:
      throw new Error("Wrong model type: " + modelType);
  }
}
