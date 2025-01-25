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

async function loadMatchData() {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = Number(urlParams.get("id")) || 0;

  const matchData = await (matchId > 0
    ? fetchFootstarMatchData(matchId)
    : fetchFootstarMatchDataMock(matchId));

  logger.info("id:", matchId, "matchData", matchData);

  const converted = convertFsMatch(matchData);

  logger.info("converted", converted);

  return converted;
}
