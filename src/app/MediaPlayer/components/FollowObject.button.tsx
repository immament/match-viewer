import { ChangeEventHandler, createRef } from "jsx-dom";
import { PopupMenu } from "./PopupMenu";
import { IMatch } from "../media.model";

const MENU_FOLLOW_BALL_IDX = 23;

export class FollowObjectButton {
  private _menu: PopupMenu;
  private _labelRef = createRef<HTMLSpanElement>();
  private _objectViewRef = createRef<HTMLInputElement>();
  private _items: {
    title: string;
    value: number;
    shortTitle?: string;
    selected?: boolean;
  }[] = Array(24);
  private _index: number = 23;

  constructor(private _match?: IMatch) {
    this._menu = new PopupMenu(this.menuClicked);

    this.initItems();
  }

  setMatch(match: IMatch) {
    this._match = match;
    match.followBall(true);
  }

  private menuClicked = (value: string | undefined) => {
    const index = Number(value);
    if (typeof index === "number") {
      if (this._match) {
        this.setFollowedObject(this._match, index);
      }
      this.setLabel(index);
      this._menu.hide();
    }
  };

  private setFollowedObject(match: IMatch, index: number): void {
    this._index = index;
    if (index <= 0) {
      match.followBall(false);
      this.hideObjectViewCheckbox();
      return;
    }
    if (index <= 22) {
      match.followPlayerByIndex(index);
      this.showObjectViewCheckbox();
      return;
    }
    if (index === MENU_FOLLOW_BALL_IDX) {
      match.followBall(true);
      match.viewController.viewFromTarget = false;
      this.hideObjectViewCheckbox();
      return;
    }
  }

  private showObjectViewCheckbox() {
    if (this._objectViewRef.current) {
      this._objectViewRef.current.style.display = "block";
    }
  }
  private hideObjectViewCheckbox() {
    if (this._objectViewRef.current) {
      this._objectViewRef.current.style.display = "none";
      this._objectViewRef.current.checked = false;
    }
  }

  private initItems() {
    this._items[0] = { title: "None", value: 0 };
    this.initPlayerItems();
    this._items[MENU_FOLLOW_BALL_IDX] = {
      title: "Ball",
      value: MENU_FOLLOW_BALL_IDX,
      shortTitle: "ball",
      selected: true
    };
  }
  private initPlayerItems() {
    for (let pl = 1; pl <= 22; pl++) {
      this._items[pl] = {
        title: "Player " + pl,
        value: pl,
        shortTitle: pl.toString()
      };
    }
  }

  private setLabel(value: number) {
    if (this._labelRef.current) {
      this._labelRef.current.textContent = this._items[value].shortTitle ?? "";
    }
  }

  private onViewFromObjectChange: ChangeEventHandler<HTMLInputElement> = (
    ev
  ) => {
    if (this._match) {
      if (ev.currentTarget.checked && this._match.isFollowBall) {
        ev.currentTarget.checked = false;
      }
      this._match.viewController.viewFromTarget = ev.currentTarget.checked;
    }
  };

  render() {
    return (
      <>
        <button
          class="mv-follow-control mv-with-label"
          onClick={this._menu.show}
          title="Follow"
        >
          <i class={"bx bx-camera-movie"}></i>
          <span ref={this._labelRef}>{this.currentItem().shortTitle}</span>
          {this._menu.render("Follow", this._items)}
        </button>
        <input
          type="checkbox"
          title="View from object"
          style="display: none"
          onChange={this.onViewFromObjectChange}
          ref={this._objectViewRef}
        />
      </>
    );
  }

  private currentItem() {
    return this._items[this._index];
  }
}
