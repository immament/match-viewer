import {
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import Stats from "three/addons/libs/stats.module.js";

import { createControls } from "./systems/controls";
import { IUpdatable, Loop } from "./systems/Loop";
import { createRenderer } from "./systems/renderer";
import { Resizer } from "./systems/Resizer";
import { createSettingsPanel } from "./systems/settings";

import { logger } from "@/app/logger";
import { CSS2DRenderer } from "three/addons";
import { createCamera } from "./components/camera";
import { createLights } from "./components/lights";
import { Match } from "./components/match/Match.model";
import { createScene, createStadium } from "./components/scene";
import { DEBUG_START_TIME } from "./systems/debug";

export interface IViewController extends IUpdatable {
  setCameraTarget(anObject: Object3D | undefined): void;
  getCameraTarget(): Object3D | undefined;
  viewFromTarget: boolean;
}

export class World implements IUpdatable {
  private _camera: PerspectiveCamera;
  private _controls: IViewController;
  private _renderer: WebGLRenderer;
  private _labelRenderer: CSS2DRenderer;
  private _scene: Scene;
  private _loop: Loop;
  private _stats: Stats;
  private _match?: Match;

  constructor(private _htmlContainer: HTMLElement) {
    this._camera = createCamera(
      _htmlContainer.clientWidth / _htmlContainer.clientHeight
    );
    ({ renderer: this._renderer, labelRenderer: this._labelRenderer } =
      createRenderer(_htmlContainer));

    this._scene = createScene();

    this._scene.layers.enableAll();
    this._camera.layers.enableAll();

    this._loop = new Loop(
      this._camera,
      this._scene,
      this._renderer,
      this._labelRenderer
    );
    _htmlContainer.append(this._renderer.domElement);
    this._controls = createControls(
      this._camera,
      this._labelRenderer.domElement
    );

    const { lights } = createLights();

    this._loop.add(this._controls);
    this._scene.add(...lights);

    new Resizer(
      _htmlContainer,
      this._camera,
      this._renderer,
      this._labelRenderer
    );

    this._stats = new Stats();
    _htmlContainer.appendChild(this._stats.dom);

    this.initKeyboard();

    //this.scene.add(createAxesHelper(), createGridHelper());
  }

  async init() {
    await createStadium(this._scene);
    this._loop.add(this);
    const settingsPanel = createSettingsPanel(this);

    this._match = new Match(this);
    await this._match.init();
    this._match.createMatchSettings(
      settingsPanel,
      this._camera,
      this._controls
    );
    this._match.changeMatchTime(DEBUG_START_TIME * 60);
  }

  addToLoop(tickable: IUpdatable) {
    this._loop.add(tickable);
  }

  addToScene(obejct: Object3D) {
    this._scene.add(obejct);
  }

  render() {
    this._renderer.render(this._scene, this._camera);
    this._labelRenderer.render(this._scene, this._camera);
  }
  camera() {
    return this._camera;
  }

  start() {
    this._loop.start();
  }

  stop() {
    this._loop.stop();
  }

  tick() {
    this._stats.update();
  }

  setCameraTarget(target: Object3D | undefined) {
    this._controls.setCameraTarget(target);
  }

  stadiumVisible(visible: boolean) {
    const stadium = this._scene.getObjectByName("stadium");
    logger.debug("stadium toogle", visible, stadium);
    if (stadium) {
      stadium.children.forEach((c) => {
        if (
          c.name !== "Pitch" &&
          c.name !== "GoalFrame" &&
          c.name !== "GoalFrameWest"
        )
          c.visible = visible;
      });
    }
  }

  // ## labels
  getCanvasCoordsOfMesh(mesh: Object3D, offset?: Vector3) {
    const vector = new Vector3();
    vector.setFromMatrixPosition(mesh.matrixWorld);
    //vector.y += 2.5;
    if (offset) vector.add(offset);
    vector.project(this._camera);

    const width = this._renderer.domElement.clientWidth;
    const height = this._renderer.domElement.clientHeight;
    const widthHalf = width / 2;
    const heightHalf = height / 2;

    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;
    return { vector };
  }

  appendDomElement(elem: HTMLElement) {
    this._htmlContainer.appendChild(elem);
    return elem;
  }

  // ## controls
  private initKeyboard() {
    document.addEventListener(
      "keyup",
      (ev) => {
        switch (ev.key) {
          case " ":
            this._match?.pauseContinue();
            break;
          case "n":
          case "N":
            this._match?.moveTime(-1);
            break;
          case "m":
          case "M":
            this._match?.moveTime(1);
            break;
          case "b":
          case "B":
            this._match?.moveTime(-0.1);
            break;
          case ",":
            this._match?.moveTime(0.1);
            break;
          case "c":
            logger.debug("camera:", this.camera(), this.camera().position);
            logger.debug("target:", this._controls.getCameraTarget());
            break;
          case "z":
            {
              const ZOOM_DISTANCE = 5;
              // set zoom to target 15
              const target = this._controls.getCameraTarget();
              if (target) {
                const newPosition = new Vector3();
                this._camera
                  .getWorldDirection(newPosition)
                  .multiplyScalar(ZOOM_DISTANCE);

                this._camera.position.subVectors(target.position, newPosition);
                if (target.name === "PlayerRoot") this._camera.position.y = 1;
              }
            }
            break;
        }
      },
      false
    );
  }
}
