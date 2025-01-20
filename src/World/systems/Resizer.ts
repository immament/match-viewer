import { PerspectiveCamera, WebGLRenderer } from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { debounce } from "/app/utils";

export class Resizer {
  private _observer: ResizeObserver;
  constructor(
    private container: HTMLElement,
    private camera: PerspectiveCamera,
    private renderer: WebGLRenderer,
    private labelRenderer: CSS2DRenderer
  ) {
    this._observer = new ResizeObserver(debounce(this.sizeChanged, 100));
    this.sizeChanged();
    this._observer.observe(container);
  }

  disconnect() {
    this._observer.disconnect();
  }

  sizeChanged = () => {
    // console.log("sizeChanged", this.container.clientWidth);
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.labelRenderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  };

  onResize: () => void = () => {};
}
