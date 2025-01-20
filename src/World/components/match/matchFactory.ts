import { IViewController } from "src/World/IViewController";
import { loadPlayers } from "../player/loadPlayers";
import { loadBall } from "./loadBall";
import { Match } from "./Match.model";

export async function createMatch(controls: IViewController): Promise<Match> {
  const { players } = await loadPlayers();
  const { ball } = await loadBall();

  const match = new Match(controls, ball, players);
  return match;
}
