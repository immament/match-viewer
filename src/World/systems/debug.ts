import { Match } from "../components/match/Match.model";
import { PlayerId } from "../components/player/Player.model";

// in minutes
export const DEBUG_START_TIME = 0; //1.45;

const DEBUG_PANEL_ID = "debugPanel";

let debugPlayerId: PlayerId = { teamIdx: 0, playerIdx: 5 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).dbg = {
  Match,
  getPlayer: (teamIdx: number, playerIdx: number) => {
    return Match.instance?.getPlayer({ teamIdx, playerIdx });
  }
};

export class MatchDebug {
  private static _instance = new MatchDebug();
  public static get instance() {
    return MatchDebug._instance;
  }

  private _debugPanel: HTMLElement | null;

  constructor() {
    this._debugPanel = document.getElementById(DEBUG_PANEL_ID);
  }

  public get isDebugPanelAvailable(): boolean {
    return !!this._debugPanel;
  }

  public set debugText(text: string | null) {
    if (this._debugPanel) {
      this._debugPanel.textContent = text;
    }
  }

  public static setText(callback: () => string) {
    if (MatchDebug._instance.isDebugPanelAvailable) {
      MatchDebug._instance.debugText = callback();
    }
  }

  public static get debugPlayerId() {
    return { ...debugPlayerId };
  }

  public static setDebugPlayerId({ teamIdx, playerIdx }: PlayerId) {
    debugPlayerId = { teamIdx, playerIdx };
  }

  public static isDebugPlayer({ teamIdx, playerIdx }: PlayerId) {
    return (
      debugPlayerId.teamIdx === teamIdx && debugPlayerId.playerIdx === playerIdx
    );
  }
}
