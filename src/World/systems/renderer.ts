import { WebGLRenderer } from "three";
import { CSS2DRenderer } from "three/examples/jsm/Addons.js";

function createRenderer(container: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true });

  if (container) {
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";

  container.appendChild(labelRenderer.domElement);
  return { renderer, labelRenderer };
}

export { createRenderer };
