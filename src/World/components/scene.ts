import { MathUtils, Scene, Vector3 } from "three";
import { GLTF, GLTFLoader, Sky } from "three/addons";
import { logger } from "/app/logger";

export function createScene() {
  const scene = new Scene();

  createSky(scene);

  //scene.background = new Color("skyblue");

  return scene;
}

function createSky(scene: Scene) {
  const sky = new Sky();
  sky.scale.setScalar(450000);

  const phi = MathUtils.degToRad(75);
  const theta = MathUtils.degToRad(135);
  const sunPosition = new Vector3().setFromSphericalCoords(1, phi, theta);

  const skyUniforms = sky.material.uniforms;
  skyUniforms.sunPosition.value = sunPosition;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 3;
  skyUniforms["mieCoefficient"].value = 0.05;
  skyUniforms["mieDirectionalG"].value = 0.97;

  scene.add(sky);
}

export async function createStadium(scene: Scene) {
  const loader = new GLTFLoader();
  let stadium: GLTF;
  const stadiumPath = "assets/models/stadium/stadium.gltf";
  try {
    stadium = await loader.loadAsync(stadiumPath);
    stadium.scene.name = "stadium";
    scene.add(stadium.scene);
  } catch (error) {
    logger.error("Exception during model loading: " + stadiumPath, error);
    throw error;
  }
}
