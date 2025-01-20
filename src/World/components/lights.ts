import { DirectionalLight, HemisphereLight, Light } from "three";

export function createLights(castShadow?: boolean): { lights: Light[] } {
  const hemiLight = new HemisphereLight(0xeeeeee, 0xbbffbb, 1);
  hemiLight.position.set(0, 1, 0);

  const dirLight = new DirectionalLight(0xffffff, 2);
  dirLight.position.set(2, 10, 2);

  if (castShadow) {
    dirLight.castShadow = false;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 100;
  }

  const lights: Light[] = [hemiLight, dirLight];

  return { lights };
  //lights.push(hemiLight, dirLight);

  //dirLight = dirLight.clone();
  // dirLight.position.set(45, 10, 30);
  // lights.push(dirLight);

  // dirLight = dirLight.clone();
  // dirLight.position.set(-45, 10, 30);
  // lights.push(dirLight);

  // dirLight = dirLight.clone();
  // dirLight.position.set(-45, 10, -30);
  // lights.push(dirLight);

  // dirLight = dirLight.clone();
  // dirLight.position.set(45, 10, -30);
  // lights.push(dirLight);

  // dirLight = dirLight.clone();
  // dirLight.position.set(0, 10, -30);
  // lights.push(dirLight);

  // dirLight = dirLight.clone();
  // dirLight.position.set(0, 10, 30);
  // lights.push(dirLight);
  //ambientLight: hemiLight, mainLight: dirLight,
}
