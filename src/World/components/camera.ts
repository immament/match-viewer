import { PerspectiveCamera } from "three";

export function createCamera(aspect: number = 1) {
  const camera = new MatchCamera(65, aspect, 0.1, 500);

  camera.position.set(0, 30, 30);

  return camera;
}

class MatchCamera extends PerspectiveCamera {
  constructor(fov?: number, aspect?: number, near?: number, far?: number) {
    super(fov, aspect, near, far);
  }
}
