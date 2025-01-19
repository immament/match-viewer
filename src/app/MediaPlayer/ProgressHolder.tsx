import { createRef, MouseEventHandler } from "jsx-dom";
import { MediaPlayer } from "./MediaPlayer";
import { debounce } from "./utils";

export class ProgressHolder {
  private _formattedTimeTooltipRef = createRef<HTMLDivElement>();
  private _playProgressRef = createRef<HTMLDivElement>();
  private _mouseTimeTooltipRef = createRef<HTMLDivElement>();
  private _progressControllRef = createRef<HTMLDivElement>();

  private _mediaPlayer?: MediaPlayer;

  public timeChanged?: (percent: number) => void;

  setMediaPlayer(player: MediaPlayer) {
    this._mediaPlayer = player;
  }

  public enable(): void {
    if (this._progressControllRef.current)
      this._progressControllRef.current.style.pointerEvents = "auto";
  }

  public setFormattedTime(value: string): void {
    if (this._formattedTimeTooltipRef.current) {
      this._formattedTimeTooltipRef.current.textContent = value;
    }
  }

  public setProgress(value: number): void {
    if (this._playProgressRef.current) {
      this._playProgressRef.current.style.width = `${value}%`;
    }
  }

  public render(): HTMLElement {
    const result = (
      <div
        class="mv-progress-control"
        ref={this._progressControllRef}
        onMouseMove={(ev) => this.onMouseMoveOverProgressControl(ev)}
        onClick={this.progressControlClick}
      >
        <div class="mv-progress-holder">
          <div class="mv-play-progress" ref={this._playProgressRef}>
            <div
              class="mv-time-tooltip"
              ref={this._formattedTimeTooltipRef}
            ></div>
          </div>
          <div class="mv-mouse-display">
            <div
              class="mv-time-tooltip"
              aria-hidden="true"
              ref={this._mouseTimeTooltipRef}
            ></div>
          </div>
        </div>
      </div>
    );
    // as HTMLDivElement & { debug?: { component: unknown } };
    if (this._playProgressRef.current) {
      // console.log("this.playProgressRef.current", this.playProgressRef.current);
      const resizer = new ResizeObserver(debounce(this.onProgressResize, 100));
      resizer.observe(this._playProgressRef.current);
    } else {
      console.warn("!this.playProgressRef.current");
    }
    return result as HTMLElement;
  }

  private progressControlClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    this.timeChanged?.(ev.offsetX / ev.currentTarget.offsetWidth);
  };

  private onProgressResize: ResizeObserverCallback = () => {
    if (!this._formattedTimeTooltipRef.current) return;
    this.fixTooltipPosition(this._formattedTimeTooltipRef.current);
  };

  private onMouseMoveOverProgressControl = debounce((ev: MouseEvent) => {
    if (!this._mouseTimeTooltipRef.current) return;
    if (!this._progressControllRef.current) return;

    const tooltipEl = this._mouseTimeTooltipRef.current;
    const progressEl = this._progressControllRef.current;

    const targetEl = ev.target as HTMLElement;
    const targetParent = tooltipEl.offsetParent as HTMLElement;
    if (!targetParent) return;

    const offsetX = this.getOffsetX(targetEl, progressEl, ev.offsetX);

    if (offsetX != undefined) {
      targetParent.style.left = offsetX + "px";
      const displayTime = this._mediaPlayer?.percentToTime(
        offsetX / progressEl.clientWidth
      );
      if (displayTime) {
        tooltipEl.textContent = displayTime;
        tooltipEl.style.visibility = "visible";
      } else {
        tooltipEl.style.visibility = "hidden";
      }
    }

    this.fixTooltipPosition(tooltipEl);
  }, 100);

  private getOffsetX(
    elem: HTMLElement,
    root: HTMLElement,
    baseOffset: number
  ): number | undefined {
    let el: HTMLElement | null = elem;
    let result = baseOffset;
    while (el) {
      if (el === root) return result;
      result += el.offsetLeft;
      el = el.offsetParent as HTMLElement | null;
    }
  }

  private fixTooltipPosition(tooltip: HTMLElement) {
    if (!tooltip.checkVisibility({ visibilityProperty: true })) return;

    const progress = tooltip.offsetParent as HTMLElement;
    const holder = progress.offsetParent as HTMLElement;
    const tooltipHalf = tooltip.clientWidth / 2;

    const progressEnd = Math.max(
      progress.offsetLeft + progress.offsetWidth,
      progress.offsetLeft
    );

    tooltip.style.right = `-${offset()}px`;

    function offset() {
      // left edge
      if (progressEnd < tooltipHalf + 4) {
        return tooltip.clientWidth - progressEnd + 4;
      }
      // right edge
      if (holder.clientWidth < tooltipHalf + progressEnd + 4) {
        return holder.clientWidth - progressEnd - 4;
      }
      return tooltipHalf;
    }
  }
}
