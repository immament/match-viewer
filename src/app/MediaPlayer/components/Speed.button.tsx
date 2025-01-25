import { createRef } from "jsx-dom";
import { PlaybackSpeedItem, PopupMenu } from "./PopupMenu";

export class SpeedButton {
  private _menu: PopupMenu;
  private _labelRef = createRef<HTMLSpanElement>();

  constructor(private _onSpeedChange: (value: number) => void) {
    this._menu = new PopupMenu(this.menuClicked);
  }

  public setSpeed(speed: number): void {
    this.setLabel(speed);
    this._menu.select(speed);
  }

  private menuClicked = (value: string | undefined) => {
    const speed = Number(value);
    if (speed > 0) {
      this._onSpeedChange(speed);
      this.setLabel(speed);
      this._menu.hide();
    }
  };

  private setLabel(speed: number) {
    if (this._labelRef.current) {
      this._labelRef.current.textContent = this.labelText(speed);
    }
  }

  private labelText(speed: number): string {
    return speed !== 1 ? `x${speed}` : "";
  }

  render(speed: number = 1) {
    const items: PlaybackSpeedItem[] = [
      { title: "Normal", value: 1 },
      { title: "x2", value: 2 },
      { title: "x4", value: 4 },
      { title: "x8", value: 8 }
    ];
    items.forEach((item) => {
      item.selected = item.value === speed;
    });

    return (
      <button
        class="mv-speed-control mv-with-label"
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          this._menu.show();
        }}
        title="Playback Speed"
      >
        <i class={"bx bx-timer"}></i>
        <span ref={this._labelRef}>{this.labelText(speed)}</span>
        {this._menu.render("Playback Speed", items)}
      </button>
    );
  }
}
