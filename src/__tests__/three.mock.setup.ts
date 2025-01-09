import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Vector3,
  WebGLRenderer,
  WebGLShadowMap
} from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { vi } from "vitest";

export function threeMockSetup({
  webGLRenderer,
  lights,
  camera,
  css2DRenderer
}: {
  webGLRenderer?: boolean;
  lights?: boolean;
  camera?: boolean;
  css2DRenderer?: boolean;
} = {}) {
  if (webGLRenderer && vi.isMockFunction(WebGLRenderer)) {
    WebGLRenderer.prototype.setSize = vi.fn();
    WebGLRenderer.prototype.setPixelRatio = vi.fn();
    WebGLRenderer.prototype.shadowMap = {} as WebGLShadowMap;
    defineMockPropertyGet(WebGLRenderer.prototype, "domElement", () =>
      document.createElement("div")
    );
  }
  if (camera) {
    if (vi.isMockFunction(PerspectiveCamera)) {
      defineMockPropertyGet(
        PerspectiveCamera.prototype,
        "position",
        () => new Vector3()
      );
    }
  }

  if (lights) {
    if (vi.isMockFunction(HemisphereLight)) {
      defineMockPropertyGet(
        HemisphereLight.prototype,
        "position",
        () => new Vector3()
      );
    }

    if (vi.isMockFunction(DirectionalLight)) {
      defineMockPropertyGet(
        DirectionalLight.prototype,
        "position",
        () => new Vector3()
      );
    }
  }

  if (css2DRenderer) {
    css2DRendererMockSetup();
  }
}

export function css2DRendererMockSetup() {
  if (vi.isMockFunction(CSS2DRenderer)) {
    CSS2DRenderer.prototype.setSize = vi.fn();
    CSS2DRenderer.prototype.getSize = vi.fn();

    defineMockProperty(CSS2DRenderer.prototype, "domElement", () =>
      document.createElement("span")
    );
  }
}

function defineMockProperty<T>(
  obj: T,
  key: string,
  valueCallback: () => unknown
) {
  Object.defineProperty(obj, key, {
    get: function (this) {
      return (this["_mock_" + key] ??= valueCallback());
    },
    set: function (this, value) {
      this["_mock_" + key] = value;
    }
  });
}
function defineMockPropertyGet<T>(
  obj: T,
  key: string,
  valueCallback: () => unknown
) {
  Object.defineProperty(obj, key, {
    get: function (this) {
      return (this["_mock_" + key] ??= valueCallback());
    }
  });
}
