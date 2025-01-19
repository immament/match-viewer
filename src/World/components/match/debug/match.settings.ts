import GUI from "lil-gui";
import { Camera } from "three";

import { IViewController } from "../../../IViewController";
import { IUpdatable } from "../../../systems/Loop";
import {
  PlayerDebug,
  PlayerDebugLabelsConfig
} from "../../player/debug/PlayerDebug";
import { Match } from "../Match.model";
import { round } from "/app/utils";

export function createMatchSettings(
  mainPanel: GUI,
  match: Match,
  camera: Camera,
  viewController: IViewController
): MatchSettings {
  const matchSettings = new MatchSettings(match, camera, viewController);

  createFolders(mainPanel, matchSettings, match);
  return matchSettings;
}

function createFolders(mainPanel: GUI, settings: MatchSettings, match: Match) {
  const panel = mainPanel.addFolder("Match");

  const pausingFolder = panel.addFolder("Pausing/Stepping");

  pausingFolder.add(settings, "pause/continue");
  pausingFolder.add(settings, "make single step");
  pausingFolder.add(settings, "modify step size", -5, 5, 0.001);
  pausingFolder.open();

  const generalSpeedFolder = panel.addFolder("General Speed");
  generalSpeedFolder
    .add(settings, "modify time scale", -5, 5, 0.01)
    .onChange((v: number) => settings.modifyTimeScale(v));

  generalSpeedFolder
    .add(settings, "match time", 0.0, match.durationMinutes, 0.01)
    .listen()
    .onChange((v: number) => settings.changeMatchTime(v));
  generalSpeedFolder.open();

  const labelsFolder = panel.addFolder("Labels");
  labelsFolder
    .add(settings, "player labels")
    .onChange((v: boolean) => settings.playerLabelsVisible(v));
  labelsFolder
    .add(settings, "display position")
    .onChange((v: boolean) => settings.playerPositionVisible(v));
  labelsFolder
    .add(settings, "player mixer time")
    .onChange((v: boolean) => settings.playerMixerTimeVisible(v));
  labelsFolder
    .add(settings, "player pose time")
    .onChange((v: boolean) => settings.playerPoseTimeVisible(v));
  labelsFolder
    .add(settings, "player speed")
    .onChange((v: boolean) => settings.playerSpeedVisible(v));
  labelsFolder
    .add(settings, "player rotation")
    .onChange((v: boolean) => settings.playerRotationVisible(v));
  labelsFolder.open();

  const viewFolder = panel.addFolder("View");
  viewFolder
    .add(settings, "follow ball")
    .listen()
    .onChange((v: boolean) => settings.followBall(v));
  viewFolder
    .add(settings, "view from followed object")
    .listen()
    .onChange((v: boolean) => settings.viewFromFollowedObject(v));

  viewFolder.open();

  panel.open();

  return panel;
}

export class MatchSettings implements IUpdatable {
  public "pause/continue" = this.pauseContinue;
  public "make single step" = this.makeSingleStep;
  public "modify step size" = 0.05;
  public "modify time scale" = 1.0;
  public "player labels" = true;
  public "display position" = false;
  public "player mixer time" = false;
  public "player pose time" = false;
  public "player speed" = false;
  public "player rotation" = false;
  public "match time" = 0;
  public "follow ball" = true;
  public "view from followed object" = false;

  private _playersDebug: PlayerDebug[] = [];

  constructor(
    private _match: Match,
    private _camera: Camera,
    private _viewController: IViewController
  ) {}

  init() {
    this.playerLabelsVisible(this["player labels"]);
    this.playerPositionVisible(this["display position"]);
    this.followBall(this["follow ball"]);
  }

  addPlayerDebug(playerDebug: PlayerDebug) {
    this._playersDebug.push(playerDebug);
  }

  private pauseContinue() {
    this._match.playPause();
  }

  private makeSingleStep() {
    //this._match.unPauseAllActions();
    this._match.pause();
    this._match.makeStep(this["modify step size"]);
  }

  public modifyTimeScale(timeScale: number) {
    this._match.modifyTimeScale(timeScale);
  }

  public playerLabelsVisible(visible: boolean) {
    const LABELS_LAYER = 1;
    if (visible) this._camera.layers.enable(LABELS_LAYER);
    else this._camera.layers.disable(LABELS_LAYER);

    this.changePlayerLabelConfig("visible", visible);
  }

  public playerPositionVisible(visible: boolean) {
    this.changePlayerLabelConfig("position", visible);
  }
  playerPoseTimeVisible(visible: boolean) {
    this.changePlayerLabelConfig("poseTime", visible);
  }
  playerSpeedVisible(visible: boolean) {
    this.changePlayerLabelConfig("speed", visible);
  }
  playerRotationVisible(visible: boolean) {
    this.changePlayerLabelConfig("rotation", visible);
  }
  playerMixerTimeVisible(visible: boolean) {
    this.changePlayerLabelConfig("mixerTime", visible);
  }

  private changePlayerLabelConfig(
    key: keyof PlayerDebugLabelsConfig,
    visible: boolean
  ): void {
    this._playersDebug.forEach((ch) => (ch.config.labels[key] = visible));
  }

  public changeMatchTime(time: number) {
    this._match.changeMatchTime(time * 60);
  }

  followBall(v: boolean) {
    this._match.followBall = v;
  }

  viewFromFollowedObject(v: boolean) {
    this._viewController.viewFromTarget = v;
  }

  public tick() {
    //logger.debug(this);
    //throw "Aa";
    this["match time"] = round(this._match.timeInMinutes, 4);
    this["modify time scale"] = this._match.timeScale();
    this["follow ball"] = this._match.followBall;
  }
}
