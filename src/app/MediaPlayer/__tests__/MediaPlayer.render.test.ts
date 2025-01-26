import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaPlayerComponent } from "../components/MediaPlayer.component";
import { IMedia } from "../media.model";
import { MediaPlayer } from "../MediaPlayer";

class MediaMock implements IMedia {
  time = 0;
  duration = 100;

  pause = vi.fn();
  continue = vi.fn();
  tooglePlay = vi.fn();
  addUpdatable = vi.fn();
  timeScale = vi.fn();
  modifyTimeScale = vi.fn();
  followBall = vi.fn();
  followPlayerByIndex = vi.fn();
}

describe("MediaPlayer Render", () => {
  let media: MediaMock;
  let player: MediaPlayer;
  let playerComponent: MediaPlayerComponent;

  beforeEach(() => {
    media = new MediaMock();
    playerComponent = new MediaPlayerComponent();
    player = new MediaPlayer(playerComponent, media);
  });

  describe("time", () => {
    it("should update tooltip time", () => {
      const elem = playerComponent.createEl();
      player.time = 91;

      expect(
        elem.querySelector(".mv-play-progress > .mv-time-tooltip")?.textContent
      ).toBe("01:31");
    });

    it("should update progress", () => {
      const elem = playerComponent.createEl();

      player.time = 60;

      expect(
        elem.querySelector<HTMLDivElement>(".mv-play-progress")?.style.width
      ).toBe("60%");
    });
  });

  describe("render", () => {
    it("should create a div element with the correct class name", () => {
      const el = playerComponent.render();

      expect(el.tagName).toBe("DIV");
      expect(el.className).toBe("mv-control-bar");
    });

    it("should create a element & append to container", () => {
      const container = document.createElement("div");
      const el = playerComponent.createEl(container);

      expect(container.children).toContain(el);
      expect(el.parentElement).toContain(container);
    });
  });

  describe("play", () => {
    it("play button click", () => {
      const elem = playerComponent.render();
      elem.querySelector<HTMLButtonElement>(".mv-play-control")?.click();
      expect(media.tooglePlay).toHaveBeenCalledOnce();
    });
  });
});
