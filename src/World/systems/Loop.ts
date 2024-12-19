import { Camera, Clock, Scene, WebGLRenderer } from "three";
import { CSS2DRenderer } from "three/examples/jsm/Addons.js";

const clock = new Clock();

export interface ITickable {
  tick(delta: number): void;
}

export class Loop {
  private updatables: ITickable[] = [];

  constructor(
    private camera: Camera,
    private scene: Scene,
    private renderer: WebGLRenderer,
    private labelRenderer: CSS2DRenderer
  ) {}

  add(...items: ITickable[]): number {
    return this.updatables.push(...items);
  }

  start() {
    clock.start();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(() => {
      // tell every animated object to tick forward one frame
      this.tick();

      // render a frame
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    });
  }

  stop() {
    clock.stop();
    this.renderer.setAnimationLoop(null);
  }

  private tick() {
    // only call the getDelta function once per frame!
    const delta = clock.getDelta();

    // logger.debug(
    //   `The last frame rendered in ${delta * 1000} milliseconds`,
    // );

    for (const object of this.updatables) {
      object.tick(delta);
    }
  }
}
