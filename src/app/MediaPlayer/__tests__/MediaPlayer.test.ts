import { beforeEach, describe, expect, it, vi } from "vitest";
import { IMedia, IMediaPlayerComponent } from "../media.model";
import { MediaPlayer } from "../MediaPlayer";

class MediaMock implements IMedia {
  time = 0;
  duration = 100;

  pause = vi.fn();
  continue = vi.fn();
  tooglePlay = vi.fn(() => true);
  addUpdatable = vi.fn();
  modifyTimeScale = vi.fn();
  followBall = vi.fn();
  followPlayerByIndex = vi.fn();
}

class MediaPlayerComponent implements IMediaPlayerComponent {
  render = vi.fn();
  setProgress = vi.fn();
  setFormattedTime = vi.fn();
  enable = vi.fn();
  setMediaPlayer = vi.fn();
  setMediaElem = vi.fn();
  setPlayStatus = vi.fn();
  setMedia = vi.fn();
}

describe("MatchPlayer", () => {
  let media: MediaMock;
  let playerComponent: IMediaPlayerComponent;

  beforeEach(() => {
    media = new MediaMock();
    playerComponent = new MediaPlayerComponent();
  });

  describe("initialization", () => {
    let player: MediaPlayer;

    it("should init with times", () => {
      media.time = 50;
      media.duration = 100;

      player = new MediaPlayer(playerComponent, media);

      expect(player.time).toBe(50);
      expect(player.totalTime).toBe(100);
    });

    it("should check max time during init", () => {
      media.time = 50;
      media.duration = 40;

      player = new MediaPlayer(playerComponent, media);

      expect(player.time).toBe(40);
    });

    it("should check min time during init", () => {
      media.time = -5;

      player = new MediaPlayer(playerComponent, media);

      expect(player.time).toBe(0);
    });
  });

  describe("total time", () => {
    let player: MediaPlayer;

    beforeEach(() => {
      player = new MediaPlayer(playerComponent, media);
    });

    it("should update total time", () => {
      media.duration = 99;
      expect(player.totalTime).toBe(99);
    });
  });

  describe("time", () => {
    let player: MediaPlayer;

    beforeEach(() => {
      player = new MediaPlayer(playerComponent, media);
    });

    it("should update time", () => {
      player.time = 50;
      expect(player.time).toBe(50);
    });

    it("should not allow update time greater then total time", () => {
      media.duration = 20;
      player.time = 99;
      expect(player.time).toBe(20);
    });

    it("should not allow set time to value lower then 0", () => {
      player.time = -100;
      expect(player.time).toBe(0);
    });

    it("should convert percent to display time", () => {
      media.duration = 182;

      expect(player.percentToDisplayTime(0.5)).toBe("01:31");
    });

    it("should go to percent time", () => {
      media.duration = 40;

      player.gotoPercentTime(0.5);

      expect(player.time).toBe(20);
    });
  });

  describe("control actions", () => {
    let player: MediaPlayer;

    beforeEach(() => {
      player = new MediaPlayer(playerComponent, media);
    });

    it("should toogle media play", () => {
      const isPlaying = player.tooglePlay();

      expect(media.tooglePlay).toHaveBeenCalledOnce();
      expect(playerComponent.setPlayStatus).toHaveBeenCalledWith(isPlaying);
    });

    it("should change playback speed", () => {
      const playbackSpeed = 8;
      player.changePlaybackSpeed(playbackSpeed);

      expect(media.modifyTimeScale).toHaveBeenLastCalledWith(playbackSpeed);
    });
  });
});
