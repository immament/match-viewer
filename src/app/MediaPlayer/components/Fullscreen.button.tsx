import { createRef } from "jsx-dom";
import screenfull from "screenfull";

export class FullscreenButton {
  private _mediaElement?: HTMLElement;
  private _iconRef = createRef<HTMLElement>();

  constructor() {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        this.update(screenfull.isFullscreen);
      });
    }
  }

  setMediaElem(anElement: HTMLElement) {
    this._mediaElement = anElement;
  }

  private onClick: () => void = () => {
    this.toogleFullscreen();
  };

  private update(isFullscreen: boolean) {
    if (this._iconRef.current) {
      this._iconRef.current.className = this.icon(isFullscreen);
      this._iconRef.current.title = this.title(isFullscreen);
    }
  }

  private icon(isFullscreen: boolean): string {
    return isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen";
  }
  private title(isFullscreen: boolean): string {
    return isFullscreen ? "Exit Fullscreen" : "Fullscreen";
  }

  render() {
    if (!screenfull.isEnabled) return <></>;
    return (
      <button
        class="mv-fullscreen-control"
        onClick={this.onClick}
        title={this.title(screenfull.isFullscreen)}
      >
        <i class={this.icon(screenfull.isFullscreen)} ref={this._iconRef}></i>
      </button>
    );
  }

  private toogleFullscreen(): void {
    if (!screenfull.isEnabled || !this._mediaElement) return;

    screenfull.toggle(this._mediaElement);
  }
}
