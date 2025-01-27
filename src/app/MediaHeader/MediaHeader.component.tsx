import { MatchData } from "src/World/components/match/MatchData.model";
import { createRef, RefObject } from "jsx-dom";

export class MediaHeaderComponent {
  private _homeTeamGoalsRef = createRef<HTMLDivElement>();
  private _awayTeamGoalsRef = createRef<HTMLDivElement>();
  private _timeRef = createRef<HTMLDivElement>();

  constructor(private _match: MatchData) {}

  homeTeamGoals(goals: number) {
    this.setTextToRef(this._homeTeamGoalsRef, goals.toString());
  }
  awayTeamGoals(goals: number) {
    this.setTextToRef(this._awayTeamGoalsRef, goals.toString());
  }
  time(aTime: string) {
    this.setTextToRef(this._timeRef, aTime);
  }

  private setTextToRef(ref: RefObject<HTMLDivElement>, value: string) {
    if (ref.current) ref.current.textContent = value;
  }
  //   private setText(elem: HTMLElement | null, value: string) {
  //     if (elem) elem.textContent = value;
  //   }

  render(): HTMLElement {
    return (
      <div class="mv-media-header">
        <div class="mv-content">
          <div></div>
          <div class="mv-team mv-team-1">
            <div class="mv-team-1 mv-box mv-team-name">
              <div>
                {this._match.homeTeam.name} {this._match.homeTeam.name}{" "}
                {this._match.homeTeam.name} {this._match.homeTeam.name}{" "}
                {this._match.homeTeam.name} {this._match.homeTeam.name}{" "}
              </div>
            </div>
            <div class="mv-team-1 mv-box" ref={this._homeTeamGoalsRef}>
              0
            </div>
          </div>
          <div class="mv-team mv-team-2">
            <div class="mv-team-2 mv-box" ref={this._awayTeamGoalsRef}>
              0
            </div>
            <div class="mv-team-2 mv-box mv-team-name">
              <div>
                {this._match.awayTeam.name} {this._match.awayTeam.name}{" "}
                {this._match.awayTeam.name} {this._match.awayTeam.name}{" "}
                {this._match.awayTeam.name} {this._match.awayTeam.name}{" "}
                {this._match.awayTeam.name}{" "}
              </div>
            </div>
          </div>
          <div class="mv-time mv-box" ref={this._timeRef}>
            00:00
          </div>
        </div>
      </div>
    ) as HTMLElement;
  }
}
