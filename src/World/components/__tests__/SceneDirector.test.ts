import { faker } from "@faker-js/faker";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D
} from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SceneDirector, TimeChangedEventDetail } from "../SceneDirector";

vi.mock("three");

// subject: director

describe("SceneDirector", () => {
  let mixerMock: AnimationMixer;
  let actionMock: AnimationAction;
  let clipMock: AnimationClip;
  let director: SceneDirector;

  beforeEach(() => {
    mixerMock = new AnimationMixer({} as Object3D);
    clipMock = new AnimationClip();
    actionMock = new AnimationAction(mixerMock, clipMock);
    director = new SceneDirector(mixerMock, actionMock);
  });

  test("should create SceneDirector", () => {
    expect(director).toBeTruthy();
  });

  test("should returns mixer time in seconds", () => {
    const expected = faker.number.float();
    vi.mocked(mixerMock).time = expected;

    expect(director.time).toBeCloseTo(expected);
  });

  test("should returns mixer time in minutes", () => {
    const expected = faker.number.float();
    vi.mocked(mixerMock).time = expected * 60;

    expect(director.timeInMinutes).toBeCloseTo(expected);
  });

  test("should returns mixer time scale", () => {
    const expected = faker.number.float();
    vi.mocked(mixerMock).timeScale = expected;

    expect(director.timeScale).toBeCloseTo(expected);
  });

  test("should returns main action duration", () => {
    const expected = faker.number.float();
    vi.mocked(clipMock).duration = expected;
    vi.mocked(actionMock).getClip.mockImplementationOnce(() => clipMock);

    expect(director.duration).toBeCloseTo(expected);
  });

  test("should add mixer", () => {
    const mixer = new AnimationMixer({} as Object3D);

    expect(director.addMixer(mixer)).toBe(1);
  });

  test("should modify main mixer time scale", () => {
    const expected = faker.number.float({ min: -5, max: 5 });
    //vi.mocked(mixerMock).timeScale = expected;

    director.modifyTimeScale(expected);

    expect(mixerMock.timeScale).toBeCloseTo(expected);
  });

  test("should modify sub mixer time scale", () => {
    const expected = faker.number.float({ min: -5, max: 5 });

    const subMixer = new AnimationMixer({} as Object3D);

    director.addMixer(subMixer);
    director.modifyTimeScale(expected);

    expect(subMixer.timeScale).toBeCloseTo(expected);
  });

  describe("gotoTime", () => {
    test("should change mixer time, when time scale = 1", () => {
      const time = faker.number.float({ min: -2, max: 15 });
      const timeScale = 1;
      mixerMock.timeScale = timeScale;
      clipMock.duration = faker.number.float(10);
      const expectedTime = toRange(time, 0, clipMock.duration);

      director.gotoTime(time);

      expect(mixerMock.setTime).toHaveBeenCalledWith(expectedTime);
      expect(actionMock.time).toBe(expectedTime);
    });

    test("should change mixer time to scaled time", () => {
      const time = faker.number.float({ min: -2, max: 15 });
      const timeScale = faker.number.float({ min: -5, max: 5 }) || 1;
      mixerMock.timeScale = timeScale;
      clipMock.duration = faker.number.float(10);
      const expectedActionTime = toRange(time, 0, clipMock.duration);
      const expectedScaledTime = expectedActionTime / timeScale;

      director.gotoTime(time);

      expect(director.time).toBeCloseTo(expectedScaledTime);
      expect(actionMock.time).toBeCloseTo(expectedActionTime);
    });

    test("should dispatch 'timeChanged' event", async () => {
      const time = faker.number.float({ min: -2, max: 15 });
      const timeScale = faker.number.float({ min: -5, max: 5 }) || 1;
      mixerMock.timeScale = timeScale;
      clipMock.duration = faker.number.float(10);
      const expectedActionTime = toRange(time, 0, clipMock.duration);
      const expectedScaledTime = expectedActionTime / timeScale;

      // act

      const timeChanged = new Promise((done) => {
        director.addEventListener("timeChanged", (ev) => {
          const tcEv = ev as CustomEvent<TimeChangedEventDetail>;
          done(tcEv.detail);
        });
      });
      director.gotoTime(time);

      // asserts
      await expect(
        timeChanged,
        "timeChanged event emitted"
      ).resolves.toMatchObject({
        scaledTime: expect.closeTo(expectedScaledTime, 5),
        timeInSeconds: expect.closeTo(expectedActionTime, 5)
      });
    });

    test("should modify sub mixer time", () => {
      const time = faker.number.float(2);
      mixerMock.timeScale = 1;
      clipMock.duration = faker.number.float();
      const expectedTime = toRange(time, 0, clipMock.duration);

      const subMixer = new AnimationMixer({} as Object3D);

      director.addMixer(subMixer);
      director.gotoTime(time);

      expect(subMixer.time).toBeCloseTo(expectedTime);
    });

    test("should unpause main action", () => {
      clipMock.duration = 2;
      mixerMock.timeScale = 1;
      actionMock.paused = true;

      director.gotoTime(1.5);

      expect(actionMock.paused).toBeFalsy();
    });

    test("should moveTime forward by 0.1", () => {
      const delta = 0.1;
      const time = 2;
      const expectedTime = time + delta;

      clipMock.duration = 5;
      mixerMock.timeScale = 1;
      mixerMock.time = time;

      director.moveTime(delta);

      expect(director.time).toBe(expectedTime);
    });
  });

  describe("moveTime", () => {
    test("should moveTime back by -0.1", () => {
      const delta = -0.1;
      const time = 2;
      const expectedTime = time + delta;

      clipMock.duration = 5;
      mixerMock.timeScale = 1;
      mixerMock.time = time;

      director.moveTime(delta);

      expect(director.time).toBe(expectedTime);
    });

    test("should moveTime to clip end, when new time greater then duration", () => {
      const delta = 2;
      mixerMock.time = 4;
      clipMock.duration = 5;
      mixerMock.timeScale = 1;
      const expectedTime = clipMock.duration;

      director.moveTime(delta);

      expect(director.time).toBe(expectedTime);
    });

    test("should moveTime to 0, when new time lower then 0", () => {
      const delta = -2;
      mixerMock.time = 1;
      clipMock.duration = 5;
      mixerMock.timeScale = 1;
      const expectedTime = 0;

      director.moveTime(delta);

      expect(director.time).toBe(expectedTime);
    });

    test("should moveTime by random time", () => {
      const delta = faker.number.float({ min: -1, max: 1 });
      const time = faker.number.float(6);
      clipMock.duration = faker.number.float(5);
      mixerMock.timeScale = 1;
      const expectedTime = toRange(time + delta, 0, clipMock.duration);

      mixerMock.time = time;

      director.moveTime(delta);

      expect(director.time).toBe(expectedTime);
    });
  });
});

function toRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
