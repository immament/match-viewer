import { IViewController } from "src/World/IViewController";
import { loadPlayers } from "../player/loadPlayers";
import { fetchFootstarMatchData as fetchFootstarMatchDataMock } from "./dataSource/__mocks__/footstar.api";
import {
  convertFsMatch,
  fetchFootstarMatchData
} from "./dataSource/footstar.api";
import { loadBall } from "./loadBall";
import { Match } from "./Match.model";
import { logger } from "/app/logger";

export async function createMatch(controls: IViewController): Promise<Match> {
  const md = await loadMatchData();
  const { players } = await loadPlayers(md);
  const { ball } = await loadBall(md.ball);

  const match = new Match(controls, ball, players);
  return match;
}

const FROM_FILE_MATCH_ID = -1;

async function loadMatchData() {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = Number(urlParams.get("id")) || 0;
  const matchData = await fetchMatch(matchId);

  logger.info("id:", matchId, "matchData", matchData);

  const converted = convertFsMatch(matchData);
  assertLiveMatch();

  logger.info("converted", converted);

  return converted;

  function fetchMatch(matchId: number) {
    if (matchId > 0) {
      return fetchFootstarMatchData(matchId);
    }
    if (matchId === FROM_FILE_MATCH_ID) {
      return fetchFootstarMatchData(matchId, "local");
    }
    return fetchFootstarMatchDataMock(matchId);
  }

  function assertLiveMatch() {
    if (
      matchId !== FROM_FILE_MATCH_ID &&
      matchData.game_info.game["@_status"] === "online"
    ) {
      alert("Live matches are not supported.");
      throw Error("Live matches are not supported.");
    }
  }
}
