type DebugPlayerId = { teamIdx: number; playerIdx: number };

let debugPlayerId: DebugPlayerId = { teamIdx: 0, playerIdx: 5 };
const debugPlayerIdx = () =>
  debugPlayerId.teamIdx * 1 + debugPlayerId.playerIdx;

export function setDebugPlayerId({
  teamIdx,
  playerIdx
}: Readonly<DebugPlayerId>) {
  debugPlayerId = { teamIdx, playerIdx };
}

export function isDebugPlayer({ teamIdx, playerIdx }: Readonly<DebugPlayerId>) {
  return (
    debugPlayerId.teamIdx === teamIdx && debugPlayerId.playerIdx === playerIdx
  );
}
export function isDebugPlayerByIdx(idx: number) {
  return debugPlayerIdx() === idx;
}
