import { MatchData } from "src/World/components/match/MatchData.model";
import "./mediaHeader.scss";
export class MediaHeaderComponent {
  constructor(private _match: MatchData) {}

  render(): HTMLElement {
    return (
      <div class="mv-media-header">
        <div class="mv-content">
          <div class="mv-team mv-team-1 mv-box">
            <div>{this._match.homeTeam.name}</div>
          </div>
          <div class="mv-result">
            <div class="mv-team-1 mv-box">0</div>
            <div class="mv-team-2 mv-box">0</div>
          </div>

          <div class="mv-team mv-team-2 mv-box">
            <div>{this._match.awayTeam.name}</div>
          </div>
          <div class="mv-time mv-box">00:00</div>
        </div>
      </div>
    ) as HTMLElement;
  }
}
