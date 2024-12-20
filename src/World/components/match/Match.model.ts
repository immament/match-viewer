import GUI from "lil-gui";

import { round } from "@/app/utils";
import { MatchDebug } from "@/World/systems/debug";
import { IUpdatable } from "@/World/systems/Loop";
import { IViewController, World } from "@/World/World";
import { Camera, Object3D, Raycaster, Vector2 } from "three";
import { timeToStep } from "../player/animations/positions";
import { loadPlayers } from "../player/loadPlayers";
import { Player, PlayerId } from "../player/Player.model";
import { PlayerDebug, PlayerDebugLabelsConfig } from "../player/PlayerDebug";
import { createPlayerSettings } from "../player/PlayerSettingsBuilder";
import { SceneDirector, TimeChangedEventDetail } from "../SceneDirector";
import { Ball } from "./ball";
import { Label } from "./Label";
import { loadBall } from "./loadBall";
import { createMatchSettings } from "./match.settings";

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

  private _director!: SceneDirector;

  private _ball?: Ball;
  private _players: Player[] = [];

  private _updatables: IUpdatable[] = [];

  private _isPaused = true;
  private _sizeOfNextStep: number = 0;

  // tooltip
  private _pointer?: Vector2;
  private _raycaster = new Raycaster();
  private _tooltip = new Label();
  // end tooltip

  private _followBall: boolean = false;
  private _debuggedPlayer?: PlayerDebug = undefined;
  private _mainSettingsPanel?: GUI;

  public get followBall(): boolean {
    return this._followBall;
  }
  public set followBall(value: boolean) {
    this._followBall = value;
    this._world.setCameraTarget(value ? this._ball : undefined);
  }

  constructor(private _world: World) {
    Match._instance = this;
  }

  public get durationMinutes(): number {
    return this._director.duration / 60;
  }
  public get duration(): number {
    return this._director.duration;
  }

  public async init(): Promise<void> {
    ({ players: this._players } = await loadPlayers());

    this._ball = (await loadBall()).ball;
    this._world.addToScene(this._ball);

    this._director = new SceneDirector(this._ball.mixer, this._ball.action);

    this._players.forEach((pl) => {
      this._world.addToScene(pl);

      this._director.addMixer(pl.mixer);
      this._director.addActions(...pl.actions.allMoveAnimations);
      pl.poses.forceUpdatePose();
      // pl.poses.addEventListener("poseChanged", (ev) => {
      //   const pcEv = ev as CustomEvent<PoseChangedEventDetail> & {
      //     target: PlayerPoses;
      //   };
      //   if (pcEv.detail.pose?.action?.isPose) {
      //     this.followPlayer(pcEv.target.player);
      //   }
      // });
    });

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

    this._updatables.push(this._ball, ...this._players);
    this._world.addToLoop(this);

    this.listenMouse();

    this.setDebugPlayer(this.getPlayer(MatchDebug.debugPlayerId));
  }

  public getPlayer({ teamIdx, playerIdx }: PlayerId) {
    if (teamIdx < 0 || playerIdx < 0) return;
    return this._players[teamIdx * 11 + playerIdx];
  }

  private setDebugPlayer(player: Player | undefined): void {
    if (player) {
      if (this._debuggedPlayer) this._debuggedPlayer.isActive = false;
      MatchDebug.setDebugPlayerId(player);
      this._debuggedPlayer = player.debug;
      this._debuggedPlayer.isActive = true;
    }
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
              this.setDebugPlayer(player);
              this.createPlayerSettings(player);
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

  // private createPlayerSettings(pointer: Vector2): void {
  //   if (!this._mainSettingsPanel) return;
  //   const player = this.playerFromPoint(pointer);
  //   if (player) createPlayerSettings(this._mainSettingsPanel, player, this);
  // }

  private playerFromPoint(pointer: Vector2): Player | undefined {
    this._raycaster.setFromCamera(pointer, this._world.camera());
    const hoveres = this._raycaster.intersectObjects(this._players, true);
    if (hoveres.length) {
      return this.playerModelAncestor(hoveres[0].object) as Player;
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

  public tick(delta: number): void {
    if (!this._ball) return;

    const mixerUpdateDelta = this.mixerDeltaTime(delta);

    for (const object of this._updatables) {
      object.tick(mixerUpdateDelta);
    }

    if (mixerUpdateDelta === 0 && this._debuggedPlayer?.debugPlay) {
      this._debuggedPlayer.player.tick(delta);
    }

    this.tooltip();
    this.debugText();
  }

  private _debug_lastTextTime: number = 0;

  private debugText(): void {
    if (!this._ball) return;
    if (this._debug_lastTextTime === this._director.time) return;

    this._debug_lastTextTime = this._director.time;

    const ball = this._ball;
    MatchDebug.setText(() => {
      const timeRaw = this._director.time ?? 0; // Math.abs(this._director.timeScale);
      return `mixer.time:
      ${round(timeRaw / 60)}, step: ${timeToStep(timeRaw)}
      , ball: position x:${round(ball.position.x, 1)}
      , z:${round(ball.position.z, 1)}
      , y:${round(ball.position.y, 2)}`;
    });
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

  public createMatchSettings(
    settingsPanel: GUI,
    camera: Camera,
    viewController: IViewController
  ): void {
    this._mainSettingsPanel = settingsPanel;
    this._updatables.push(
      createMatchSettings(settingsPanel, this, camera, viewController)
    );
    if (this._debuggedPlayer) {
      this.createPlayerSettings(this._debuggedPlayer.player);
    }
  }

  private createPlayerSettings(player: Player): void {
    if (!this._mainSettingsPanel) return;
    const playerSettings = createPlayerSettings(
      this._mainSettingsPanel,
      player,
      this
    );
    if (playerSettings) this._updatables.push(playerSettings);
  }

  public followPlayer(player: Player): void {
    this._followBall = false;
    this._world.setCameraTarget(player.model);
  }

  // ## controlls ##

  public get time(): number {
    return this._director.time;
  }
  public get timeInMinutes(): number {
    return this._director.timeInMinutes;
  }

  public changeMatchTime(time: number): void {
    // this._players.forEach((ch) => {
    //   //ch.actions.fadeAllPoses();
    //   //ch.actions.pauseAllMoveActions();
    // });

    this._director.gotoTime(time);
  }

  public makeStep(stepSize: number): void {
    this._sizeOfNextStep = stepSize;
  }

  public moveTime(delta: number): void {
    //this._players.forEach((ch) => {
    //  ch.actions.fadeAllPoses();
    //});
    this._director.moveTime(delta);
  }

  public timeScale(): number {
    return this._director.timeScale;
  }

  public modifyTimeScale(timeScale: number): void {
    this._director.modifyTimeScale(timeScale);
  }

  public pause(): void {
    this._isPaused = true;
  }

  public continue(): void {
    this._isPaused = true;
  }

  public pauseContinue(): boolean {
    return (this._isPaused = !this._isPaused);
  }

  // ## DEBUG
  public playerLabelsVisible(
    key: keyof PlayerDebugLabelsConfig,
    visible: boolean
  ): void {
    this._players.forEach((ch) => {
      ch.debug.config.labels[key] = visible;
    });
  }
}
