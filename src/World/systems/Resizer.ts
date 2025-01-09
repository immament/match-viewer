import { PerspectiveCamera, WebGLRenderer } from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export class Resizer {
  constructor(
    container: HTMLElement,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    labelRenderer: CSS2DRenderer
  ) {
    // set initial size
    setSize(container, camera, renderer, labelRenderer);

    window.addEventListener("resize", () => {
      // set the size again if a resize occurs
      setSize(container, camera, renderer, labelRenderer);
      // perform any custom actions
      this.onResize();
      //logger.debug(camera.position);
    });
  }

  onResize: () => void = () => {};
}

function setSize(
  container: HTMLElement,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  labelRenderer: CSS2DRenderer
) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  labelRenderer.setSize(container.clientWidth, container.clientHeight);
}
