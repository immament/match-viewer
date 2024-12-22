import { Camera, Object3D, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons";

import { logger } from "@/app/logger";
import { IViewController } from "../IViewController";
import { ViewFromTarget } from "./ViewFromTarget";

class OrbitViewController extends OrbitControls implements IViewController {
  private _cameraTarget: Object3D | undefined;

  private _viewFromTarget = new ViewFromTarget();

  public get viewFromTarget(): boolean {
    return this._viewFromTarget.enabled;
  }
  public set viewFromTarget(value: boolean) {
    this._viewFromTarget.enabled = value;
  }

  constructor(camera: Camera, canvas: HTMLElement) {
    super(camera, canvas);
    this.enableDamping = true;
    this.listenToKeyEvents(window);

    this.maxPolarAngle = Math.PI / 2 - 0.01;
    this.minDistance = 0.4;
    this.maxDistance = 150;
    this.zoomSpeed = 2;
  }
  zoomToTarget(zoomDistance: number): void {
    const target = this.getCameraTarget();
    if (target) {
      const newPosition = new Vector3();
      this.camera.getWorldDirection(newPosition).multiplyScalar(zoomDistance);

      this.camera.position.subVectors(target.position, newPosition);
      if (target.name === "PlayerRoot") this.camera.position.y = 1;
    }
  }

  tick(delta: number): void {
    if (this._cameraTarget) {
      if (this.viewFromTarget) {
        this._viewFromTarget.update(
          this._cameraTarget,
          this.camera,
          this.target
        );
      } else {
        this.target.copy(this._cameraTarget.position);
      }
    }
    this.update(delta);
  }

  setCameraTarget(aTarget: Object3D | undefined): void {
    this._cameraTarget = aTarget;

    logger.debug(
      "setCameraTarget:",
      ...(aTarget
        ? [
            "name:",
            aTarget.name,
            "userData:",
            aTarget.userData,
            "target:",
            aTarget //.getObjectByName("Ch38_Shirt")
          ]
        : [undefined])
    );
  }
  getCameraTarget(): Object3D | undefined {
    return this._cameraTarget;
  }

  public get camera(): PerspectiveCamera {
    return this.object as PerspectiveCamera;
  }
}

export function createControls(
  camera: Camera,
  canvas: HTMLElement
): IViewController {
  return new OrbitViewController(camera, canvas);
}

//controls.target.y = 1;

// const result: ITickable = {
//   tick(_delta: number) {
//     controls.update();
// if (controls.newTarget) {
//   move(
//     controls.target,
//     controls.newTarget,
//     () => (controls.newTarget = null)
//   );
//   // const distance = controls.target.distanceTo(controls.newTarget);
//   // if (distance < 0.1) {
//   //   controls.target.copy(controls.newTarget);
//   //   controls.newTarget = null;
//   // } else {
//   //   let lerpAlpha = Math.min(1 / (3 * distance), 0.5);
//   //   controls.target.lerp(controls.newTarget, lerpAlpha);
//   // }
// }

// if (controls.newCameraPosition) {
//   move(
//     camera.position,
//     controls.newCameraPosition,
//     () => (controls.newCameraPosition = null)
//   );
//   // const distance = camera.position.distanceTo(controls.newCameraPosition);
//   // if (distance < 0.1) {
//   //   camera.position.copy(controls.newCameraPosition);
//   //   controls.newCameraPosition = null;
//   // } else {
//   //   let lerpAlpha = Math.min(1 / (3 * distance), 0.5);
//   //   camera.position.lerp(controls.newCameraPosition, lerpAlpha);
//   // }
// }
//   }
// };

// function move(current, newPos, resetCallback) {
//   const distance = current.distanceTo(newPos);
//   if (distance < 0.1) {
//     current.copy(newPos);
//     resetCallback();
//   } else {
//     let lerpAlpha = Math.min(1 / (3 * distance), 0.5);
//     current.lerp(newPos, lerpAlpha);
//   }
// }

//return result;
