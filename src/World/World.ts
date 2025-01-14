import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import Stats from "three/addons/libs/stats.module.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { createCamera } from "./components/camera";
import { createLights } from "./components/lights";
import { Match } from "./components/match/Match.model";
import { createMatch } from "./components/match/matchFactory";
import { createScene, createStadium } from "./components/scene";
import { IViewController } from "./IViewController";
import { createControls } from "./systems/controls";
import { IUpdatable, Loop } from "./systems/Loop";
import { createLabelRenderer, createRenderer } from "./systems/renderer";
import { Resizer } from "./systems/Resizer";
import { initKeyboard } from "./WorldControls";
import { logger } from "/app/logger";

export const DEBUG_START_TIME = 0; //1.45;

export class World implements IUpdatable {
  private _camera: PerspectiveCamera;
  private _controls: IViewController;
  private _renderer: WebGLRenderer;
  private _scene: Scene;
  private _loop: Loop;
  private _match: Match | undefined;
  private _debug_stats?: Stats;
  private _debug_labelRenderer: CSS2DRenderer;

  constructor(htmlContainer: HTMLElement) {
    this._camera = createCamera(
      htmlContainer.clientWidth / htmlContainer.clientHeight
    );

    this._renderer = createRenderer(htmlContainer);
    this._debug_labelRenderer = createLabelRenderer(htmlContainer);

    this._scene = createScene();

    // this._scene.layers.enableAll();
    // this._camera.layers.enableAll();

    this._loop = new Loop(
      this._camera,
      this._scene,
      this._renderer,
      this._debug_labelRenderer
    );

    this._controls = createControls(
      this._camera,
      this._debug_labelRenderer.domElement
    );

    const { lights } = createLights();

    this._loop.add(this._controls);
    this._scene.add(...lights);

    new Resizer(
      htmlContainer,
      this._camera,
      this._renderer,
      this._debug_labelRenderer
    );

    // this._debug_stats = new Stats();
    // htmlContainer.appendChild(this._debug_stats.dom);

    //this.scene.add(createAxesHelper(), createGridHelper());
  }

  async init() {
    await createStadium(this._scene);
    this._loop.add(this);
    // const settingsPanel = createSettingsPanel(this);

    this._match = await createMatch(this._controls);

    // const objects = this._match.init();
    this._match.addToScene(this._scene);
    this.addToLoop(this._match);

    this._match.changeMatchTime(DEBUG_START_TIME * 60);

    initKeyboard(this._match, this._controls);
  }

  addToLoop(tickable: IUpdatable) {
    this._loop.add(tickable);
  }

  // addToScene(obejct: Object3D) {
  //   this._scene.add(obejct);
  // }

  // render() {
  //   this._renderer.render(this._scene, this._camera);
  //   this._labelRenderer.render(this._scene, this._camera);
  // }

  start() {
    this._loop.start();
  }

  stop() {
    this._loop.stop();
  }

  tick() {
    this._debug_stats?.update();
  }

  // setCameraTarget(target: Object3D | undefined) {
  //   this._controls.setCameraTarget(target);
  // }

  debug_stadiumVisible(visible: boolean) {
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

  public get debug_controls(): IViewController {
    return this._controls;
  }
  public get debug_match(): Match | undefined {
    return this._match;
  }
}
