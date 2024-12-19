import { logger } from "@/app/logger";
import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  MeshStandardMaterial,
  SphereGeometry,
  TextureLoader,
  VectorKeyframeTrack
} from "three";
import { getBallPositions } from "../player/_mock_/ball.mock";
import {
  BALL_RADIUS,
  BallPositionsConfig,
  MATCH_TIME_SCALE
} from "../player/animations/positions";
import { Ball } from "./ball";

export async function loadBall() {
  const texture = new TextureLoader().load("assets/models/ball.jpg");
  const geometry = new SphereGeometry(BALL_RADIUS, 16, 8);
  const material = new MeshStandardMaterial({ map: texture });
  const ball = new Ball(geometry, material);

  const mixer = new AnimationMixer(ball);

  const { positionAction } = positionAnimation(mixer);
  //ball.position.y = BALL_OFFSET_Y;

  positionAction.play();
  ball.setMixer(mixer, positionAction);

  return { ball };
}

function positionAnimation(mixer: AnimationMixer) {
  const rawPositions = getBallPositions();
  const { times, positions } = createPositionsArrays(rawPositions);
  const positionKF = new VectorKeyframeTrack(".position", times, positions);

  const positionClip = new AnimationClip(
    "ball.position",
    times[times.length - 1],
    [positionKF]
  );

  const positionAction = mixer.clipAction(positionClip);
  positionAction.loop = LoopOnce;
  positionAction.clampWhenFinished = true;

  return { positionAction };
}

// pz => height
function createPositionsArrays({ px, pz, pHeight }: BallPositionsConfig) {
  if (px.length !== pz.length || pHeight.length !== px.length) {
    logger.warn("positions arays have diffrent length!", {
      x_length: px.length,
      z_length: pz.length,
      height_length: pHeight.length
    });
  }

  const times: number[] = Array(px.length);
  const positions: number[] = Array(px.length * 3);

  for (
    let index = 0, time = 0, positionIndex = 0;
    index < px.length;
    index++, time = index * MATCH_TIME_SCALE, positionIndex = index * 3
  ) {
    times[index] = time;

    positions[positionIndex] = px[index];
    positions[positionIndex + 1] = pHeight[index];
    positions[positionIndex + 2] = pz[index];
  }

  logger.trace("ball positions start:", positions.slice(0, 9), px.slice(0, 3));
  logger.trace("ball positions end:", positions.slice(-9), px.slice(-3));

  logger.trace("ball times length:", times.length);
  logger.trace("ball times start:", times.slice(0, 9));
  logger.trace("ball times end:", times.slice(-9));

  if (times.length * 3 !== positions.length) {
    throw new Error(
      `Ball: Wrong array sizes times.length*3 !== positions.length: ${times.length}, ${positions.length}`
    );
  }
  return { times, positions };
}

// export async function loadBall() {
//   const loader = new GLTFLoader();
//   const soldierData = await loader.loadAsync("assets/models/Ball.glb");

//   const { ball } = setupModel(soldierData);

//   return { ball };
// }

// export function setupModel(data: GLTF) {
//   logger.debug(data.scene, data);
//   const ball = data.scene as Object3D;

//   // model.traverse(function (object: Object3D & { isMesh?: boolean }) {
//   //   if (object.isMesh) object.castShadow = true;
//   // });

//   return { ball };
// }
