import { MathUtils, Scene, Vector3 } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { logger } from "/app/logger";

export function createScene() {
  const scene = new Scene();
  scene.name = "MatchScene";

  scene.add(createSky());

  //scene.background = new Color("skyblue");

  return scene;
}

function createSky() {
  const sky = new Sky();
  sky.scale.setScalar(450000);

  setUniforms(sky.material.uniforms);
  return sky;

  function setUniforms(skyUniforms: typeof sky.material.uniforms) {
    // the radius, or the Euclidean distance (straight-line distance) from the point to the origin
    skyUniforms.sunPosition.value = sunPosition();
    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 3;
    skyUniforms["mieCoefficient"].value = 0.05;
    skyUniforms["mieDirectionalG"].value = 0.97;
  }

  function sunPosition() {
    return new Vector3().setFromSphericalCoords(
      1.0, // the radius, or the Euclidean distance (straight-line distance) from the point to the origin
      MathUtils.degToRad(75), // polar angle in radians from the y (up) axis
      MathUtils.degToRad(135) // equator angle in radians around the y (up) axis
    );
  }
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
