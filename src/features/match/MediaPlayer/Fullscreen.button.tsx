import { createRef } from "jsx-dom";
import { useContext, useEffect, useState } from "react";
import screenfull from "screenfull";
import { ContainerContext } from "/app/Container.context";

export function FullscreenButton() {
  const [state, setState] = useState(calculatesState(screenfull.isFullscreen));
  const fullscreenContainer = useContext(ContainerContext);

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        setState(calculatesState(screenfull.isFullscreen));
      });
    }
  }, [screenfull.isEnabled]);

  if (!screenfull.isEnabled || !fullscreenContainer) return <></>;

  return (
    <button
      className="mv-fullscreen-control"
      onClick={toogleFullscreen}
      title={state.title}
    >
      <i className={state.iconCss} />
    </button>
  );

  function calculatesState(isFullscreen: boolean) {
    return {
      iconCss: isFullscreen ? "bx bx-exit-fullscreen" : "bx bx-fullscreen",
      title: isFullscreen ? "Exit Fullscreen" : "Fullscreen"
    };
  }

  function toogleFullscreen(): void {
    if (!screenfull.isEnabled || !fullscreenContainer) return;
    screenfull.toggle(fullscreenContainer);
  }
}

class FullscreenButton2 {
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
        className="mv-fullscreen-control"
        onClick={this.onClick}
        title={this.title(screenfull.isFullscreen)}
      >
        <i
          className={this.icon(screenfull.isFullscreen)}
          ref={this._iconRef}
        ></i>
      </button>
    );
  }

  private toogleFullscreen(): void {
    if (!screenfull.isEnabled || !this._mediaElement) return;

    screenfull.toggle(this._mediaElement);
  }
}
