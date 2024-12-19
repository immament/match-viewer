import { Player } from "@/World/components/player/Player.model";
import { PoseTransitionProps } from "@/World/components/player/PlayerPoses";
import { MatchDebug } from "@/World/systems/debug";
import logger, {
  Logger,
  LoggingMethod,
  LogLevelNames,
  LogLevelNumbers
} from "loglevel";
import prefix from "loglevel-plugin-prefix";

export const logLevels = [
  "SILENT",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE"
] as const;
export type LogLevels = (typeof logLevels)[number];

type LoggerPlayerId = {
  teamIdx: number;
  playerIdx: number;
};

type PlayerLoggerMethod = (player: LoggerPlayerId, ...msg: unknown[]) => void;
interface PlayerLogger extends Logger {
  trace: PlayerLoggerMethod;
  debug: PlayerLoggerMethod;
  log: PlayerLoggerMethod;
  info: PlayerLoggerMethod;
  warn: PlayerLoggerMethod;
  error: PlayerLoggerMethod;
}

logger.setLevel("DEBUG");

prefix.reg(logger);

const originalFactory = logger.methodFactory;

logger.methodFactory = function (methodName, logLevel, loggerName) {
  if (methodName === "trace") {
    // eslint-disable-next-line no-console
    return (...args) => console.debug(...args);
  }
  return originalFactory(methodName, logLevel, loggerName);
};

const shortDate = new Intl.DateTimeFormat("en-US", {
  // hour: "2-digit",
  // minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: false
});
prefix.apply(logger, {
  template: "[%t] %l (%n)",
  nameFormatter: (name) => name || "",
  timestampFormatter: shortDate.format
});

// PLAYER filtered LOGGER
const playerLogger = logger.getLogger("player") as PlayerLogger;

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

  const a: LoggingMethod = (aPrefix, player: LoggerPlayerId, ...args) => {
    if (player?.teamIdx !== undefined) {
      if (MatchDebug.isDebugPlayer(player)) {
        logMethod(aPrefix + `[${player.teamIdx}/${player.playerIdx}]`, ...args);
      }
    }
  };
  return a;

  // return function (aPrefix, player: LoggerPlayerId, ...args) {
  //   if (player?.teamIdx !== undefined) {
  //     if (MatchDebug.isDebugPlayer(player)) {
  //       //aPrefix += `[${player.teamIdx}/${player.playerIdx}]`;
  //       logMethod.bind(console, aPrefix, );
  //     }
  //   }
  // };
};

prefix.apply(playerLogger, {
  template: "[%t] %l (%n)"
});

export function logDebugTransition(
  player: Player,
  name: string,
  props: PoseTransitionProps,
  ...args: unknown[]
) {
  if (!player.debug.isActive) return;
  logTransition("debug", player, name, props, ...args);
}

function logTransition(
  logLevel: LogLevelNames,
  player: Player,
  name: string,
  { oldAction, newAction, newPose, transitionId }: PoseTransitionProps,
  ...args: unknown[]
) {
  if (!player.debug.isActive) return;
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

export { logger, playerLogger };
