import { Object3D, Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

type LabelProps = {
  position?: Vector3;
  text?: string | null;
  layerIdx?: number;
};

export class Label {
  private _label: CSS2DObject;
  private _labelDiv: HTMLDivElement;

  constructor({ position, text = null, layerIdx }: LabelProps = {}) {
    this._labelDiv = document.createElement("div");
    this._labelDiv.className = "label";
    this._labelDiv.textContent = text;

    this._label = new CSS2DObject(this._labelDiv);
    if (position) this._label.position.copy(position);
    if (layerIdx != undefined) this._label.layers.set(layerIdx);
  }

  addTo(object: Object3D | undefined) {
    if (!object) {
      this.remove();
      return;
    }

    object.add(this._label);
  }

  remove() {
    this._label.parent?.remove(this._label);
  }

  setText(text: string | null) {
    this._labelDiv.textContent = text;
  }

  // private print(object: Object3D) {
  //   let current: Object3D | null = object;
  //   let result = "";
  //   while (current) {
  //     result += "," + current.name;
  //     current = current.parent;
  //   }

  //   console.log("parents:", result);
  // }
}
