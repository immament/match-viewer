import { MediaPlayerComponent } from "./MediaPlayer.component";
import { IMedia, MediaPlayer } from "./MediaPlayer";

export function testJsx(media?: IMedia) {
  const playerContainer = document.getElementById("mediaPlayer");
  if (playerContainer) {
    const mediaPlayer = new MediaPlayer(new MediaPlayerComponent(), media);
    mediaPlayer.createEl(playerContainer);

    return mediaPlayer;
  }
}

// export function testMatchPlayerComponent() {
//   const playerContainer = document.getElementById("mediaPlayer");
//   if (playerContainer) {
//     const mp = new MediaPlayerComponent();
//     playerContainer?.appendChild(mp.render());
//     let i = 0;
//     setInterval(() => {
//       mp.progress(i++);
//       mp.formattedTime = i.toString();
//     }, 1000);
//   }
// }
