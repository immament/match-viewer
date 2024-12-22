import { round } from "@/app/utils";
import { Match } from "@/World/components/match/Match.model";
import { timeToStep } from "@/World/components/player/animations/positions";
import { PlayerId } from "../../components/player/PlayerId";
import { IUpdatable } from "../Loop";
import { isDebugPlayer, setDebugPlayerId } from "./debug.constants";

// in minutes

const DEBUG_PANEL_ID = "debugPanel";

// (window as any).dbg = {
//   Match,
//   getPlayer: (teamIdx: number, playerIdx: number) => {
//     return Match.instance?.getPlayer({ teamIdx, playerIdx });
//   }
// };

export class MatchDebug implements IUpdatable {
  private static _instance: MatchDebug;

  static get instance() {
    return this._instance;
  }
  static init(match: Match) {
    this._instance = new MatchDebug(match);
  }

  private _debugPanel: HTMLElement | null;

  constructor(private _match: Match) {
    this._debugPanel = document.getElementById(DEBUG_PANEL_ID);
  }

  tick(delta: number): void {
    this.createDebugText(delta);
  }

  public get isDebugPanelAvailable(): boolean {
    return !!this._debugPanel;
  }

  public set debugText(text: string | null) {
    if (this._debugPanel) {
      this._debugPanel.textContent = text;
    }
  }

  public setText(callback: () => string) {
    if (this.isDebugPanelAvailable) {
      this.debugText = callback();
    }
  }

  // public static get debugPlayerId() {
  //   return { ...debugPlayerId };
  // }

  public static setDebugPlayerId(playerId: PlayerId) {
    setDebugPlayerId(playerId);
  }

  public static isDebugPlayer(playerId: PlayerId) {
    return isDebugPlayer(playerId);
  }

  private _debug_lastTextTime: number = 0;

  private createDebugText(delta: number): void {
    if (!delta || !this._match.ballPosition) return;
    if (this._debug_lastTextTime === this._match.time) return;

    this._debug_lastTextTime = this._match.time;

    const ball = this._match.ballPosition;
    this.setText(() => {
      const timeRaw = this._match.time ?? 0; // Math.abs(this._director.timeScale);
      return `mixer.time:
      ${round(timeRaw / 60)}, step: ${timeToStep(timeRaw)}
      , ball: position x:${round(ball.x, 1)}
      , z:${round(ball.z, 1)}
      , y:${round(ball.y, 2)}`;
    });
  }
}
