import {
  AnimationClip,
  BufferGeometry,
  MeshStandardMaterial,
  NormalBufferAttributes,
  Object3D,
  SkinnedMesh
} from "three";
import { GLTF, GLTFLoader, SkeletonUtils } from "three/addons";

import { logger } from "@/app/logger";
import { PoseTypes } from "./animations/Pose.model";
import { Player } from "./Player.model";
import {
  AnimationIdxs,
  AnimationNames,
  setupPlayer,
  setupPlayerModel
} from "./setupPlayerModel";

type ModelType = "player";
const MODEL_TYPE: ModelType = "player";

export type DefaulSkinnedMesh = SkinnedMesh<
  BufferGeometry<NormalBufferAttributes>,
  MeshStandardMaterial
>;

export class ModelConfig {
  public get getMeshFn(): (model: Object3D) => Object3D | undefined {
    return this._getMeshFn;
  }
  public get modelPath(): string {
    return this._modelPath;
  }

  constructor(
    private _modelPath: string,
    private _getMeshFn: (model: Object3D) => Object3D | undefined,
    private _animationIdxs?: Partial<AnimationIdxs>,
    private _animationNames?: Partial<AnimationNames>
  ) {}

  animationClip(clips: AnimationClip[], pose: PoseTypes) {
    if (this._animationIdxs && this._animationIdxs[pose]) {
      return clips[this._animationIdxs[pose]];
    }

    if (this._animationNames) {
      const name = this._animationNames[pose];
      if (name) return clips.find((c) => c.name === name);
    }

    return undefined;
  }
}

export async function loadPlayers(): Promise<{ players: Player[] }> {
  const modelConfig = modelConfigFactory(MODEL_TYPE);

  const loader = new GLTFLoader();
  let characterData: GLTF;
  try {
    characterData = await loader.loadAsync(modelConfig.modelPath);
  } catch (error) {
    logger.error(
      "Exception during model loading: " + modelConfig.modelPath,
      error
    );
    throw error;
  }

  const { model: baseModel, animations } = setupPlayerModel(characterData);
  logger.info("animations:", animations, ", baseModel:", baseModel);

  const players: Player[] = [];

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
      const { player } = setupPlayer(
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
        "/assets/models/player/player.gltf",
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

// const anims = [
//   {
//     name: "pl.t_pose",
//     duration: 0.06666667014360428
//   },
//   {
//     name: "sk.idle.anim",
//     duration: 2
//   },
//   {
//     name: "sk.jog_forward",
//     duration: 0.8666666746139526
//   },
//   {
//     name: "sk.offensive_idle.anim",
//     duration: 10.600000381469727
//   },
//   {
//     name: "sk.soccer_header.anim",
//     duration: 2.4000000953674316
//   },
//   {
//     name: "sk.soccer_idle",
//     duration: 6.233333110809326
//   },
//   {
//     name: "sk.soccer_pass.anim",
//     duration: 1.6333333253860474
//   },
//   {
//     name: "sk.throw_in.anim",
//     duration: 2.799999952316284
//   },
//   {
//     name: "sk.walking.anim",
//     duration: 1.0666667222976685
//   }
// ];
