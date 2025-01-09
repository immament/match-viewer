import * as three from "three";
import { vi } from "vitest";

export { Clock, Layers, MathUtils, Quaternion, Vector2, Vector3 } from "three";

export class Object3D {
  parent: three.Object3D | null;
  readonly position = new three.Vector3();
  readonly rotation = new three.Euler();
  add: (...object: three.Object3D[]) => this = vi.fn((...object) => {
    object.forEach((obj) => {
      obj.parent = this;
    });
    return this;
  });
  remove: (...object: three.Object3D[]) => this = vi.fn();
}

export class Group extends Object3D {}

export class Mesh extends Object3D {}

export const SphereGeometry = vi.fn();
export const MeshBasicMaterial = vi.fn();
export const MeshStandardMaterial = vi.fn();
export const DirectionalLight = vi.fn();
export const HemisphereLight = vi.fn();

export const Scene = vi.fn(() => ({ add: vi.fn() }));

export const WebGLRenderer = vi.fn(() => ({
  setSize: vi.fn(),
  render: vi.fn(),
  setPixelRatio: vi.fn(),
  domElement: document.createElement("canvas")
}));

export class AnimationMixer implements three.EventDispatcher {
  time: number;
  constructor(private _object: three.Object3D = {} as three.Object3D) {
    this.time = 0;
  }
  addEventListener = vi.fn();
  hasEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();

  setTime: (time: number) => void = vi.fn((time) => {
    this.time = time;
  });
  clipAction(
    clip: AnimationClip,
    _root?: three.Object3D | three.AnimationObjectGroup,
    blendMode?: three.AnimationBlendMode
  ): AnimationAction {
    const animation = new AnimationAction(this, clip);
    animation.blendMode = blendMode ?? three.NormalAnimationBlendMode;
    return animation;
  }
  update: (delta: number) => void = vi.fn();
}

export class AnimationClip {
  constructor(public name: string, public duration: number) {}
}

export class AnimationAction {
  constructor(private mixer: AnimationMixer, private clip: AnimationClip) {}
  time: number = 0;
  timeScale: number = 1;
  weight: number = 1;
  blendMode: three.AnimationBlendMode;

  getClip: () => AnimationClip = vi.fn(() => this.clip);

  play = vi.fn();
  stop = vi.fn();
  reset = vi.fn();
  isRunning = vi.fn();
  fadeIn = vi.fn();
  fadeOut = vi.fn();
  crossFadeFrom = vi.fn();
  crossFadeTo = vi.fn();
  setEffectiveWeight = vi.fn((value) => (this.weight = value));
  getEffectiveWeight = vi.fn(() => this.weight);
  setEffectiveTimeScale = vi.fn((value) => (this.timeScale = value));
  getEffectiveTimeScale = vi.fn(() => this.timeScale);
  setLoop = vi.fn();
  clampWhenFinished = vi.fn();
  enabled = vi.fn();
  paused = vi.fn();
  loop = vi.fn();

  repetitions = vi.fn();
  zeroSlopeAtStart = vi.fn();
  zeroSlopeAtEnd = vi.fn();
}

export class PerspectiveCamera {
  position = {
    set: vi.fn()
  };
  lookAt = vi.fn();
  updateProjectionMatrix = vi.fn();
  constructor(fov: number, aspect: number, near: number, far: number) {
    // Initialize properties if needed
  }
}

export class TextureLoader {
  constructor(public path: string) {}
  load() {
    return new three.Texture();
  }
}

//TextureLoader.prototype.load = vi.fn(() => new three.Texture());

export const VectorKeyframeTrack = vi.fn();

export const Raycaster = vi.fn();
