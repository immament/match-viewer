import logger, { LogLevelNames, LogLevelNumbers, Logger } from "loglevel";
import prefix from "loglevel-plugin-prefix";

import { originalFactory } from "@/app/logger";
import { isDebugPlayer } from "@/World/systems/debug/debug.constants";
import { PoseTransitionProps } from "./PoseTransitionProps";

// PLAYER filtered LOGGER
export const playerLogger = logger.getLogger("player") as PlayerLogger;

playerLogger.isActive = (playerId: LoggerPlayerId) => isDebugPlayer(playerId);

playerLogger.setLevel("DEBUG");
// only log for debuged player
playerLogger.methodFactory = function playerLoggerFn(
  methodName: LogLevelNames,
  level: LogLevelNumbers,
  loggerName: string | symbol
) {
  const logMethod =
    methodName === "trace"
      ? // eslint-disable-next-line no-console
        console.log
      : originalFactory(methodName, level, loggerName);

  return (aPrefix, playerId: LoggerPlayerId, ...args) => {
    if (playerId?.teamIdx !== undefined) {
      if (isDebugPlayer(playerId)) {
        logMethod(
          aPrefix + `[${playerId.teamIdx}/${playerId.playerIdx}]`,
          ...args
        );
      }
    }
  };
};
prefix.apply(playerLogger, { template: "[%t] %l (%n)" });

export function logDebugTransition(
  player: LoggerPlayerId,
  name: string,
  props: PoseTransitionProps,
  ...args: unknown[]
) {
  //if (!player.debug.isActive) return;
  logTransition("debug", player, name, props, ...args);
}
function logTransition(
  logLevel: LogLevelNames,
  player: LoggerPlayerId,
  name: string,
  { oldAction, newAction, newPose, transitionId }: PoseTransitionProps,
  ...args: unknown[]
) {
  //if (!player.debug.isActive) return;
  //if (newPose.type !== PoseTypes.jogBack) return;
  playerLogger[logLevel](
    player,
    `[${transitionId}]`,
    name,
    oldAction?.poseType,
    "=>",
    newAction.poseType,
    ", newPose:",
    newPose,
    ", newAction state:",
    newAction.state(),
    ...args
  );
}

type LoggerPlayerId = { teamIdx: number; playerIdx: number };

type PlayerLoggerMethod = (player: LoggerPlayerId, ...msg: unknown[]) => void;

interface PlayerLogger extends Logger {
  trace: PlayerLoggerMethod;
  debug: PlayerLoggerMethod;
  log: PlayerLoggerMethod;
  info: PlayerLoggerMethod;
  warn: PlayerLoggerMethod;
  error: PlayerLoggerMethod;
  isActive: (playerId: LoggerPlayerId) => boolean;
}
