import { Object3D, PerspectiveCamera } from "three";
import { IUpdatable } from "./systems/Loop";

export interface IViewController extends IUpdatable {
  setCameraTarget(anObject: Object3D | undefined): void;
  getCameraTarget(): Object3D | undefined;
  zoomToTarget(zoomDistance: number): void;
  viewFromTarget: boolean;
  readonly camera: PerspectiveCamera;
}
