import { XMLParser } from "fast-xml-parser";
import {
  BALL_OFFSET_Y,
  ballHeightToPitch,
  MatchPositions,
  xToPitch,
  zToPitch
} from "../../player/animations/positions.utils";
import { FootstarMatchData, FootstarMatchResponse } from "./footstar.api.model";
import {
  convertBallPositions,
  convertPlayersPositions,
  convertPoses
} from "./footstar.mapper";

const matchApiBaseUrl =
  "https://nd.footstar.org/match/get_data_nviewer.asp?jogo_id=";
// // const matchApiBaseUrl = "/api/";

function apiUrl(matchId: number): string {
  return matchApiBaseUrl + matchId;
}

export async function fetchFootstarMatchData(
  matchId: number
): Promise<FootstarMatchData> {
  const url = apiUrl(matchId);
  const resp = await fetch(url, { mode: "cors", method: "GET" });
  const xml = await resp.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const matchResp = parser.parse(xml) as FootstarMatchResponse;
  const data = matchResp.xml.general;
  if (!data.matchId) data.matchId = matchId;
  return data;
}

export function convertFsMatch(match: FootstarMatchData): MatchPositions {
  const gameData = match.game_data.j;

  return {
    ball: {
      px: convertBallPositions(gameData, "x").map((v) => xToPitch(v)),
      pz: convertBallPositions(gameData, "y").map((v) => zToPitch(v)),
      pHeight: convertBallPositions(gameData, "z").map(
        (h) => ballHeightToPitch(h) + BALL_OFFSET_Y
      )
    },
    players: [
      convertPlayersPositions(gameData, "c"),
      convertPlayersPositions(gameData, "f")
    ],
    poses: convertPoses(gameData)
  };
}
