import { IViewController } from "src/World/IViewController";
import { Object3D, Raycaster, Scene, Vector2, Vector3 } from "three";
import { IUpdatable } from "../../systems/Loop";
import { PlayerId } from "../player/PlayerId";
import { PlayerMesh } from "../player/PlayerMesh";
import { SceneDirector, TimeChangedEventDetail } from "../SceneDirector";
import { Ball } from "./Ball";
import { Label } from "./Label";

enum MouseButton {
  Main = 0,
  Auxiliary = 1,
  Secondary = 2,
  Fourth = 3,
  Fifth = 4
}

export class Match implements IUpdatable {
  private static _instance?: Match;
  static get instance(): Match | undefined {
    return this._instance;
  }

  private _director: SceneDirector;
  private _updatables: IUpdatable[] = [];
  private _isPaused = true;
  private _sizeOfNextStep: number = 0;

  // tooltip
  private _pointer?: Vector2;
  private _raycaster = new Raycaster();
  private _tooltip = new Label();
  // end tooltip

  private _followBall: boolean = false;

  constructor(
    private _controls: IViewController,
    private _ball: Ball,
    private _players: PlayerMesh[]
  ) {
    Match._instance = this;
    this._director = new SceneDirector(this._ball.mixer, this._ball.action);
    this.initPlayers();
    this._updatables.push(this._ball, ...this._players);
    this.listenDirectorTimeChanges();
    this.listenMouse();
  }

  get ballPosition(): Vector3 | undefined {
    return this._ball.position;
  }

  get followBall(): boolean {
    return this._followBall;
  }
  set followBall(value: boolean) {
    this._followBall = value;
    this._controls.setCameraTarget(value ? this._ball : undefined);
  }

  get durationMinutes(): number {
    return this._director.duration / 60;
  }
  get duration(): number {
    return this._director.duration;
  }

  addToScene(scene: Scene) {
    scene.add(this._ball);
    scene.add(...this._players);
  }

  getPlayer({ teamIdx, playerIdx }: PlayerId) {
    if (teamIdx < 0 || playerIdx < 0) return;
    return this._players[teamIdx * 11 + playerIdx];
  }
  getPlayerByIdx(idx: number) {
    return this._players[idx];
  }

  addUpdatable(updatable: IUpdatable) {
    this._updatables.push(updatable);
  }

  tick(delta: number): void {
    if (!this._ball) return;

    const mixerUpdateDelta = this.mixerDeltaTime(delta);

    for (const object of this._updatables) {
      object.tick(mixerUpdateDelta, delta);
    }

    this.tooltip();
    //this.debugText();
  }
  followPlayer(player: PlayerMesh): void {
    this._followBall = false;
    this._controls.setCameraTarget(player.model);
  }

  private listenMouse(): void {
    window.addEventListener("mouseup", ({ clientX, clientY, button }) => {
      switch (button) {
        case MouseButton.Main:
          this._pointer = pointer(clientX, clientY);
          break;
        case MouseButton.Auxiliary:
          {
            const player = this.playerFromPoint(pointer(clientX, clientY));
            if (player) {
              // TODO
              // this.setDebugPlayer(player);
              // this.createPlayerSettings(player);
            }
          }
          break;
        case MouseButton.Secondary:
          this.followClick(pointer(clientX, clientY));
          break;
      }
    });

    function pointer(x: number, y: number): Vector2 {
      return new Vector2(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
      );
    }
  }

  private followClick(pointer: Vector2): void {
    const player = this.playerFromPoint(pointer);
    if (player) this.followPlayer(player);
  }

  private playerFromPoint(pointer: Vector2): PlayerMesh | undefined {
    this._raycaster.setFromCamera(pointer, this._controls.camera);
    const hoveres = this._raycaster.intersectObjects(this._players, true);
    if (hoveres.length) {
      return this.playerModelAncestor(hoveres[0].object) as PlayerMesh;
    }
  }

  private tooltip(): void {
    if (this._pointer) {
      const player = this.playerFromPoint(this._pointer);
      if (player) {
        this._tooltip.addTo(player.model);
        this._tooltip.setText(`${player.debugInfo()}`);
      } else {
        this._tooltip.remove();
      }
      this._pointer = undefined;
    }
  }

  private playerModelAncestor(object: Object3D) {
    let current: Object3D | null = object;
    while (current) {
      if (current.name === "PlayerModel") return current;
      current = current.parent;
    }
  }

  private mixerDeltaTime(delta: number): number {
    let result = delta;

    if (this._isPaused) {
      result = 0;
    }

    if (this._sizeOfNextStep) {
      result = this._sizeOfNextStep;
      this._sizeOfNextStep = 0;
    }
    const { time, duration } = this._director;

    if (time + result > duration) return Math.max(0, duration - time);
    if (time + result < 0) return Math.max(0, -time);
    return result;
  }

  private initPlayers(): void {
    this._players.forEach((pl) => {
      this._director.addMixer(pl.mixer);
      pl.poses.forceUpdatePose();
    });
  }

  private listenDirectorTimeChanges(): void {
    this._director.addEventListener(
      "timeChanged",
      (ev: CustomEventInit<TimeChangedEventDetail>) => {
        this._players.forEach((pl) => {
          pl.poses.forceUpdatePose();
          pl.actions.unPauseAllMoveActions();
          if (ev.detail) pl.actions.setTime(ev.detail.timeInSeconds);
        });
      }
    );
  }

  // ## controlls ##

  get time(): number {
    return this._director.time;
  }
  get timeInMinutes(): number {
    return this._director.timeInMinutes;
  }

  changeMatchTime(time: number): void {
    this._director.gotoTime(time);
  }

  makeStep(stepSize: number): void {
    this._sizeOfNextStep = stepSize;
  }

  moveTime(delta: number): void {
    this._director.moveTime(delta);
  }

  timeScale(): number {
    return this._director.timeScale;
  }

  modifyTimeScale(timeScale: number): void {
    this._director.modifyTimeScale(timeScale);
  }

  pause(): void {
    this._isPaused = true;
  }

  continue(): void {
    this._isPaused = true;
  }

  pauseContinue(): boolean {
    return (this._isPaused = !this._isPaused);
  }
}
