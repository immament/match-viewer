import { Camera, Object3D, Vector3 } from "three";

export class ViewFromTarget {
  private _enabled = false;
  private offset = new Vector3(0, 1.8, 0);
  private direction = new Vector3();
  private offsetScale = 1;
  private _onMouseWheel: (event: WheelEvent) => void;

  constructor() {
    this._onMouseWheel = this.onMouseWheel.bind(this);
  }

  public get enabled(): boolean {
    return this._enabled;
  }
  public set enabled(value: boolean) {
    this._enabled = value;
    this.switchListenMouseWheel();
  }

  update(targetObject: Object3D, camera: Camera, targetPoint: Vector3) {
    if (!this._enabled || !targetObject) return;
    if (targetObject.name === "PlayerRoot") {
      this.offset.y = 1.8;
    } else {
      this.offset.y = 0.1;
    }

    targetObject.getWorldDirection(this.direction).add(this.offset);

    camera.position
      .set(targetObject.position.x, 0, targetObject.position.z)
      .addScaledVector(this.direction, -this.offsetScale);

    targetPoint.addVectors(targetObject.position, this.direction);
  }

  private switchListenMouseWheel() {
    if (this.enabled) {
      document.addEventListener("wheel", this._onMouseWheel, { passive: true });
    } else {
      document.removeEventListener("wheel", this._onMouseWheel);
    }
  }

  private onMouseWheel(event: WheelEvent) {
    this.offsetScale += event.deltaY * -0.01;
    this.restrictOffsetScale();
  }

  private restrictOffsetScale() {
    this.offsetScale = Math.min(Math.max(0.9, this.offsetScale), 4);
  }
}
