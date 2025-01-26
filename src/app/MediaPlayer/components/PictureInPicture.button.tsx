import { createRef } from "jsx-dom";

// WORN: not finished
export class PictureInPictureButton {
  private _videoRef = createRef<HTMLVideoElement>();
  private async pictureInPicture() {
    // console.log(
    //   "aa",
    //   this._videoRef.current,
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   (document.getElementById("app") as any).requestPictureInPicture,
    //   document.pictureInPictureElement,
    //   document.pictureInPictureEnabled
    // );

    if ("documentPictureInPicture" in window) {
      const app = document.getElementById("mediaPlayer");
      if (!app || !app.parentNode) return;
      const player = app.parentNode;

      const tmpHolder = player.insertBefore(
        <div class="tmp-holder"></div>,
        player.firstChild
      );

      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: app.offsetWidth,
        height: app.offsetHeight,
        preferInitialWindowPlacement: true
      });

      this.copyStyles(pipWindow);

      pipWindow.document.body.appendChild(app);

      pipWindow.addEventListener("pagehide", (event: PageTransitionEvent) => {
        const pipVideo = (event.target as HTMLElement)?.querySelector(
          "#mediaPlayer"
        );
        if (pipVideo) {
          tmpHolder.replaceWith(pipVideo);
        }
      });
    }

    // this._videoRef.current?.requestPictureInPicture({wid})
  }
  private copyStyles(pipWindow: Window) {
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules]
          .map((rule) => rule.cssText)
          .join("");
        const style = document.createElement("style");

        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        alert("copy style err: " + e);
        const link = document.createElement("link");
        if (styleSheet.href == null) {
          return;
        }

        link.rel = "stylesheet";
        link.type = styleSheet.type;
        link.media = styleSheet.media.toString();
        link.href = styleSheet.href;
        pipWindow.document.head.appendChild(link);
      }
    });
  }

  render() {
    return (
      <button class="mv-pip-control" onClick={this.onClick}>
        <i class="bx bx-expand"></i>
      </button>
    );
  }

  private onClick: () => void = () => {
    this.pictureInPicture();
  };
}
