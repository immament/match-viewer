import {
  createRef,
  FocusEventHandler,
  MouseEventHandler,
  ReactElement
} from "jsx-dom";

export type PlaybackSpeedItem = {
  title: string;
  value: string | number;
  selected?: boolean;
};

export class PopupMenu {
  constructor(private _menuClicked: (value: string | undefined) => void) {}
  private _menuRef = createRef<HTMLDivElement>();

  public readonly show = () => {
    if (this._menuRef.current) {
      this._menuRef.current.style.display = "block";
      this._menuRef.current.focus();
    }
  };
  public readonly hide = () => {
    if (this._menuRef.current) {
      this._menuRef.current.style.display = "none";
    }
  };

  private blur: FocusEventHandler = () => {
    this.hide();
  };

  private menuClicked: MouseEventHandler<HTMLDivElement> = (ev) => {
    ev.stopPropagation();
    const target = ev.target as HTMLElement;
    if (!target) return;

    this.markSelected(ev.currentTarget, target);
    this._menuClicked(target.dataset.val);
  };

  public select(value: number | string) {
    if (this._menuRef.current) {
      const selectedElem = this._menuRef.current.querySelector(
        `.mv-menuitem[data-val="${value}"]`
      ) as HTMLElement;
      this.markSelected(this._menuRef.current, selectedElem);
    }
  }

  private markSelected(menu: HTMLDivElement, target: HTMLElement | undefined) {
    const className = "mv-menuitem-selected";
    menu
      .querySelectorAll(`.${className}`)
      .forEach((elem) => elem.classList.remove(className));
    target?.classList.add(className);
  }

  public render(
    title: string,
    items?: PlaybackSpeedItem[],
    menuContent?: ReactElement
  ) {
    if (items) {
      menuContent = (
        <>
          {items.map(({ title, value, selected }) => (
            <div
              class={"mv-menuitem" + (selected ? " mv-menuitem-selected" : "")}
              data-val={value}
            >
              {title}
            </div>
          ))}
        </>
      );
    }
    return (
      <div
        class="mv-popup-menu"
        ref={this._menuRef}
        onBlur={this.blur}
        tabIndex={-1}
      >
        <div class="mv-menuheader">{title}</div>
        <div onClick={this.menuClicked} class="mv-menucontent">
          {menuContent}
        </div>
      </div>
    );
  }
}
