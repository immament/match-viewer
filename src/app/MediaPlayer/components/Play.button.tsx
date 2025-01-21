import { createRef } from "jsx-dom";

export class PlayButton {
  private _iconRef = createRef<HTMLElement>();

  public onClick?: () => void;

  public setPaused(isPaused: boolean) {
    if (this._iconRef.current)
      this._iconRef.current.className = isPaused ? "bx bx-play" : "bx bx-pause";
  }
  render() {
    return (
      <button class="mv-play-control" onClick={this.onClick} title="Play">
        <i class={"bx bx-play"} ref={this._iconRef}></i>
      </button>
    );
  }
}
