import { logLevels, LogLevels } from "@/app/logger";
import { playerLogger } from "@/World/components/player/player.logger";
import GUI from "lil-gui";
import { AnimationAction } from "three";
import { Match } from "../../match/Match.model";
import { Player } from "../Player.model";
import {
  ActionSettings,
  ActionTypes,
  actionTypes,
  PlayerSettings,
  poseTypes,
  SwitchPoseSettings
} from "./player.settings";
import { PlayerDebug } from "./PlayerDebug";

export function createPlayerSettings(
  mainPanel: GUI,
  player: Player,
  playerDebug: PlayerDebug | undefined,
  match: Match
): PlayerSettings | undefined {
  const title = playerPanelTitle(player);

  if (mainPanel.folders.find((f) => f._title === title)) return;

  const builder = new PlayerSettingsBuilder(
    mainPanel,
    player,
    playerDebug,
    match
  );
  const playerSettings = builder.createPlayerSettings();
  builder.createFolders();
  return playerSettings;
}

class PlayerSettingsBuilder {
  private _playerSettings!: PlayerSettings;
  private _switchPoseSettings!: SwitchPoseSettings;
  private _actionSettings!: ActionSettings;
  private panel!: GUI;

  constructor(
    private _mainPanel: GUI,
    private _player: Player,
    private _playerDebug: PlayerDebug | undefined,
    private _match: Match
  ) {}

  public createPlayerSettings() {
    this._switchPoseSettings = {} as SwitchPoseSettings;
    this._actionSettings = this.createActionsSettings();
    this._playerSettings = new PlayerSettings(
      this._player,
      this._playerDebug,
      this._match,
      this._actionSettings
    );
    return this._playerSettings;
  }

  private createActionsSettings(): ActionSettings {
    return {
      enabled: {},
      paused: {},
      weight: {},
      timeScale: {},
      isRunning: {},
      time: {}
    };
  }

  public createFolders() {
    if (!this._playerSettings) {
      throw new Error(
        "PlayerSettings not created. Please run first 'createPlayerSettings'"
      );
    }
    this.panel = this._mainPanel.addFolder(playerPanelTitle(this._player));

    this.createVisibilityFolder();
    this.createActivationFolder();
    this.createLogsFolder();
    this.createPausingFolder(this._match);
    this.createCrossfadingFolder(this._switchPoseSettings);
    this.createPoseActionsFolder();
    this.createGeneralSpeedFolder();

    this.panel.open();
  }

  private get settings() {
    return this._playerSettings.settings;
  }

  private createGeneralSpeedFolder() {
    const generalSpeedFolder = this.panel.addFolder("General Speed");
    generalSpeedFolder
      .add(this.settings, "modify time scale", -5, 5, 0.1)
      .onChange((ts: number) => this._playerSettings.modifyTimeScale(ts));
  }

  private createVisibilityFolder() {
    const visibilityFolder = this.panel.addFolder("Visibility");
    visibilityFolder
      .add(this.settings, "show model")
      .onChange((v: boolean) => this._playerSettings.showModel(v));
    visibilityFolder
      .add(this.settings, "show skeleton")
      .onChange((v: boolean) => this._playerSettings.showSkeleton(v));
  }

  private createActivationFolder() {
    const activationFolder = this.panel.addFolder("Activation/Deactivation");
    activationFolder.add(this.settings, "stop all actions");
    activationFolder.add(this.settings, "play all actions");
  }

  private createLogsFolder() {
    const folder = this.panel.addFolder("Logs");
    folder
      .add(this.settings, "debug logs")
      .onChange((v: boolean) => this._playerSettings.debugLogs(v));
    folder
      .add(this.settings, "player log level", logLevels)
      .onChange((level: LogLevels) => playerLogger.setLevel(level));
    folder.open();
  }

  private createPausingFolder(aMatch: Match) {
    const pausingFolder = this.panel.addFolder("Pausing/Stepping");
    pausingFolder
      .add(this.settings, "debug play")
      .onChange((v: boolean) => this._playerSettings.debugPlay(v));
    pausingFolder.add(this.settings, "pause all actions");
    pausingFolder.add(this.settings, "unpause all actions");
    pausingFolder.add(this.settings, "make single step");
    pausingFolder.add(this.settings, "modify step size", 0.01, 0.1, 0.001);
    pausingFolder.add(this.settings, "sync mixer");
    pausingFolder
      .add(
        this.settings,
        "mixer time [m]",
        0.0,
        aMatch.durationMinutes + 1,
        0.01
      )
      .listen()
      .onChange((time: number) =>
        this._playerSettings.setPlayerMixerTime(time)
      );
    pausingFolder.add(this.settings, "mixer time [s]").listen().disable();

    pausingFolder
      .add(this.settings, "pause poses change")
      .listen()
      .onChange((v: boolean) => this._playerSettings.pausePoses(v));
    pausingFolder.add(this.settings, "pause position & rotation");
    pausingFolder.add(this.settings, "prepare test");
    pausingFolder.open();
  }

  private createCrossfadingFolder(switchPoseSettings: SwitchPoseSettings) {
    const crossfadingFolder = this.panel.addFolder("Crossfading");

    poseTypes.forEach((pose) => {
      switchPoseSettings[`to ${pose}`] = () =>
        this._playerSettings.switchPoseTo(pose);
      crossfadingFolder.add(switchPoseSettings, `to ${pose}`);
    });
    crossfadingFolder
      .add(this.settings, "with sync cross fade")
      .onChange((v: boolean) => this._playerSettings.syncCrossFade(v));
    crossfadingFolder.add(this.settings, "use default duration");
    crossfadingFolder.add(this.settings, "set custom duration", 0, 10, 0.01);
  }

  private createPoseActionsFolder() {
    const actionsFolder = this.panel.addFolder("Actions").open();

    const enableFolder = actionsFolder.addFolder("Actions enable");
    const pauseFolder = actionsFolder.addFolder("Actions pause");
    const weightFolder = actionsFolder.addFolder("Actions weight");
    const timeScaleFolder = actionsFolder.addFolder("Time scale");
    const timeFolder = actionsFolder.addFolder("Actions time");
    const runningFolder = actionsFolder.addFolder("Running");

    actionTypes.forEach((key) => {
      const action = this._playerSettings.getAction(key);
      if (action) {
        this.actionSettings(key, action, "enabled", enableFolder);
        this.actionSettings(key, action, "paused", pauseFolder);
        this.timeActionSettings(key, action, timeFolder);

        this._actionSettings.weight[key] = action.getEffectiveWeight();
        weightFolder
          .add(this._actionSettings.weight, key, 0.0, 1.0, 0.01)
          .listen()
          .onChange((weight: number) => action.setEffectiveWeight(weight));

        this._actionSettings.timeScale[key] = action.getEffectiveTimeScale();
        timeScaleFolder
          .add(this._actionSettings.timeScale, key, 0.0, 1.0, 0.01)
          .listen()
          .onChange((ts: number) => action.setEffectiveTimeScale(ts));

        this.createIsRunningActionSettings(key, action, runningFolder);
      }
    });
  }

  // private enableActionSettings(
  //   key: keyof typeof this._actionSettings.enabled,
  //   action: AnimationAction,
  //   folder: GUI
  // ) {
  //   this._actionSettings.enabled[key] = action.enabled;
  //   folder
  //     .add(this._actionSettings.enabled, key)
  //     .listen()
  //     .onChange((enabled: boolean) => {
  //       action.enabled = enabled;
  //     });
  // }

  private actionSettings<T extends "enabled" | "paused" | "time">(
    key: ActionTypes,
    action: AnimationAction,
    field: T,
    folder: GUI
  ) {
    const settings = this._actionSettings[field];
    settings[key] = action[field];
    folder
      .add(settings, key)
      .listen()
      .onChange((value: (typeof action)[T]) => {
        action[field] = value;
      });
  }

  // private createPauseActionSettings(
  //   key: keyof typeof this._actionSettings.paused,
  //   action: AnimationAction,
  //   folder: GUI
  // ) {
  //   this._actionSettings.paused[key] = action.paused;
  //   folder
  //     .add(this._actionSettings.paused, key)
  //     .listen()
  //     .onChange((value: boolean) => {
  //       action.paused = value;
  //     });
  // }

  private timeActionSettings(
    key: keyof typeof this._actionSettings.time,
    action: AnimationAction,
    folder: GUI
  ) {
    this._actionSettings.time[key] = action.time;
    folder
      .add(this._actionSettings.time, key, 0.0, action.getClip().duration, 0.01)
      .listen()
      .onChange((time: number) => {
        while (time > action.getClip().duration) {
          time -= action.getClip().duration;
        }
        action.time = time;
      });
  }

  private createIsRunningActionSettings(
    key: keyof typeof this._actionSettings.isRunning,
    action: AnimationAction,
    folder: GUI
  ) {
    this._actionSettings.isRunning[key] = action.isRunning();
    folder
      .add(this._actionSettings.isRunning, key)
      .listen()
      .onChange((running: boolean) => {
        if (running) action.play();
        else action.stop();
      });
  }
}
function playerPanelTitle(player: Player) {
  return "Player " + player.teamIdx + "." + player.playerIdx;
}
