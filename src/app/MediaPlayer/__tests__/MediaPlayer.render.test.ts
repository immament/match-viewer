import { beforeEach, describe, expect, it, vi } from "vitest";
import { IMedia, IMediaPlayerComponent } from "../media.model";
import { MediaPlayer } from "../MediaPlayer";
import { MediaPlayerComponent } from "../MediaPlayer.component";

class MediaMock implements IMedia {
  time = 0;
  duration = 100;

  pause = vi.fn();
  continue = vi.fn();
  tooglePlay = vi.fn();
  addUpdatable = vi.fn();
  modifyTimeScale(): void {}
}

describe("MediaPlayer Render", () => {
  let media: MediaMock;
  let player: MediaPlayer;
  let playerComponent: IMediaPlayerComponent;

  beforeEach(() => {
    media = new MediaMock();
    playerComponent = new MediaPlayerComponent();
    player = new MediaPlayer(playerComponent, media);
  });

  describe("time", () => {
    it("should update tooltip time", () => {
      const elem = player.createEl();
      player.time = 91;

      expect(
        elem.querySelector(".mv-play-progress > .mv-time-tooltip")?.textContent
      ).toBe("01:31");
    });

    it("should update progress", () => {
      const elem = player.createEl();

      player.time = 60;

      expect(
        elem.querySelector<HTMLDivElement>(".mv-play-progress")?.style.width
      ).toBe("60%");
    });
  });

  describe("render", () => {
    it("should create a div element with the correct class name", () => {
      const el = player.render();

      expect(el.tagName).toBe("DIV");
      expect(el.className).toBe("mv-control-bar");
    });

    it("should create a element & append to container", () => {
      const container = document.createElement("div");
      const el = player.createEl(container);

      expect(container.children).toContain(el);
      expect(el.parentElement).toContain(container);
    });
  });

  describe("play", () => {
    it("play button click", () => {
      const elem = player.render();
      elem.querySelector<HTMLButtonElement>(".mv-play-control")?.click();
      expect(media.tooglePlay).toHaveBeenCalledOnce();
    });
  });
});
