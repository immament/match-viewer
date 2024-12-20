import { Clock } from "three";

export class MaxFramesClock extends Clock {
  private minDelta?: number;
  private borrow = 0;

  constructor(autoStart?: boolean, maxFps?: number) {
    super(autoStart);
    if (maxFps) {
      this.minDelta = 1 / maxFps;
    }
  }

  getDelta() {
    let diff = 0;

    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }

    if (this.running) {
      const newTime = performance.now();

      diff = (newTime - this.oldTime) / 1000;
      if (this.minDelta) {
        const borrow = diff - this.minDelta + this.borrow;
        if (borrow < 0) {
          console.log("skipped", diff, this.minDelta, borrow);
          return 0;
        }
        this.borrow = borrow;
      }

      this.oldTime = newTime;

      this.elapsedTime += diff;
    }

    return diff;
  }
}
