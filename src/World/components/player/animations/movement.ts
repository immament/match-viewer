import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from "three";

import { playerLogger } from "@/World/components/player/player.logger";
import { PlayerId } from "../PlayerId";
import { getPlayer as getAwayPlayer } from "../_mock_/awayPlayersPosition.big.mock";
import { getBallPositions } from "../_mock_/ball.mock";
import { getPlayer as getHomePlayer } from "../_mock_/homePlayersPosition.big.mock";
import { getPlayerPoses } from "../_mock_/playersPose.mock";
import { RawPoseEvents } from "./Pose.model";
import { PoseBuilder } from "./PoseBuilder";
import { PoseBuilderContext } from "./PoseBuilderContext";
import { RotationBuilder } from "./RotationBuilder";
import {
  BallPositionsConfig,
  MATCH_TIME_SCALE,
  PlayerPositions,
  xToPitch,
  zToPitch
} from "./positions";

export function createMoveActions(mixer: AnimationMixer, playerId: PlayerId) {
  const { positionAction, positionKF } = createPositionAction(playerId, mixer);

  const { rotateAction, poses } = createRotateAction(
    mixer,
    positionKF,
    getPlayerPoses(playerId.teamIdx, playerId.playerIdx),
    getBallPositions(),
    playerId
  );

  return { positionAction, rotateAction, poses };
}

function createPositionAction(playerId: PlayerId, mixer: AnimationMixer) {
  const playerPositions =
    playerId.teamIdx === 0
      ? getHomePlayer(playerId.playerIdx)
      : getAwayPlayer(playerId.playerIdx);
  const { times, positions } = createPositionsArrays(playerPositions, playerId);

  const positionKF = new VectorKeyframeTrack(".position", times, positions);

  const positionClip = new AnimationClip("position", -1, [positionKF]);
  const positionAction = mixer.clipAction(positionClip);

  positionAction.loop = LoopOnce;
  positionAction.clampWhenFinished = true;
  return { positionAction, positionKF };
}

function createPositionsArrays(
  { px, pz }: PlayerPositions,
  playerId: PlayerId
) {
  playerLogger.trace(
    playerId,
    `time scale: ${MATCH_TIME_SCALE}, posX_Array.length: ${px.length}`
  );
  if (px.length !== pz.length) {
    throw new Error(
      `Different raw positions array lenghts; px: ${px.length}, pz: ${pz.length}`
    );
  }

  const times: number[] = Array(px.length);
  const positions: number[] = Array(px.length * 3);

  px.forEach((x, index) => {
    times[index] = index * MATCH_TIME_SCALE;
    positions[index * 3] = xToPitch(x);
    positions[index * 3 + 1] = 0;
    positions[index * 3 + 2] = zToPitch(pz[index]);
  });
  fixLastRecords(positions, 3);
  traceResult();

  if (times.length * 3 !== positions.length) {
    throw new Error(
      `Wrong array sizes times.length*3 !== positions.length: ${times.length}, ${positions.length}`
    );
  }

  return { times, positions };

  function fixLastRecords(array: unknown[], count: number) {
    for (let i = array.length - count; i < array.length; i++) {
      playerLogger.trace(playerId, "positions.length", array.length, i);
      array[i] = array[i - count];
    }
  }

  function traceResult() {
    if (playerLogger.isActive(playerId)) {
      playerLogger.trace(
        playerId,
        " positions start:",
        positions.slice(0, 6),
        "/",
        px.slice(0, 3)
      );
      playerLogger.trace(
        playerId,
        " positions end:",
        positions.slice(-6),
        "/",
        px.slice(-3)
      );

      playerLogger.trace(playerId, " times length:", times.length);
      playerLogger.trace(playerId, " times start:", times.slice(0, 3));
      playerLogger.trace(playerId, " times end:", times.slice(-3));
    }
  }
}

function createRotateAction(
  mixer: AnimationMixer,
  positionKF: VectorKeyframeTrack,
  rawPoses: RawPoseEvents,
  ballPositions: BallPositionsConfig,
  playerId: PlayerId
) {
  const { rotateValues, poses } = buildSteps(
    positionKF,
    rawPoses,
    playerId,
    ballPositions
  );

  const rotateAction = createRotateAnimationAction(
    positionKF.times,
    rotateValues,
    mixer
  );

  traceResult();

  return { rotateAction, poses };

  // ++ internal +++

  function createRotateAnimationAction(
    times: Float32Array,
    rotateValues: number[],
    mixer: AnimationMixer
  ) {
    const rotateKF = new QuaternionKeyframeTrack(
      ".quaternion",
      times,
      rotateValues
    );

    const rotateClip = new AnimationClip("rotate", -1, [rotateKF]);
    const rotateAction = mixer.clipAction(rotateClip);
    rotateAction.loop = LoopOnce;
    rotateAction.clampWhenFinished = true;
    return rotateAction;
  }

  function buildSteps(
    positionKF: VectorKeyframeTrack,
    rawPoses: RawPoseEvents,
    playerId: PlayerId,
    ballPositions: BallPositionsConfig
  ) {
    const times = positionKF.times;
    const rotationBuilder = new RotationBuilder();
    const poseBuilder = new PoseBuilder(playerId, rotationBuilder);

    const context = new PoseBuilderContext(
      playerId,
      positionKF.values,
      ballPositions,
      times,
      rawPoses
    );

    for (context.step = 0; context.step < times.length - 1; context.step++) {
      poseBuilder.calculatePose(context);
    }

    return {
      times,
      rotateValues: context.getRotationResult(),
      poses: context.getPosesResult()
    };
  }

  function traceResult() {
    if (playerLogger.isActive(playerId)) {
      playerLogger.trace(playerId, "rotations length:", rotateValues.length);
      playerLogger.trace(
        playerId,
        "rotations start:",
        rotateValues.slice(0, 8)
      );
      playerLogger.trace(playerId, "rotations end:", rotateValues.slice(-8));

      playerLogger.trace(playerId, "poses length:", poses.length);
      playerLogger.trace(playerId, "poses start:", poses.slice(0, 3));
      playerLogger.trace(playerId, "poses end:", poses.slice(-3));
    }
  }
}
