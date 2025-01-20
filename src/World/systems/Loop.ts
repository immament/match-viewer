import { Camera, Scene, WebGLRenderer } from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { MaxFramesClock } from "./MaxFramesClock";

export interface IUpdatable {
  tick(delta: number, realDelta?: number): void;
}

export class Loop {
  private _updatables: IUpdatable[] = [];
  private _clock = new MaxFramesClock(false, 60);

  constructor(
    private _camera: Camera,
    private _scene: Scene,
    private _renderer: WebGLRenderer,
    private _labelRenderer?: CSS2DRenderer
  ) {}

  add(...items: IUpdatable[]): number {
    return this._updatables.push(...items);
  }

  start() {
    this._clock.start();
    this._renderer.render(this._scene, this._camera);

    this._renderer.setAnimationLoop(() => {
      const delta = this._clock.getDelta();
      if (!delta) return false;
      this.tick(delta);
      this._renderer.render(this._scene, this._camera);
      this._labelRenderer?.render(this._scene, this._camera);
    });
  }

  stop() {
    this._clock.stop();
    this._renderer.setAnimationLoop(null);
  }

  private tick(delta: number): void {
    for (const object of this._updatables) {
      object.tick(delta);
    }
  }
}
