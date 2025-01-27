import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "./app/withTypes";
import { fetchMatchById } from "./features/match/match.slice";
import { MediaPlayerComponent } from "./features/match/MediaPlayer/MediaPlayer.component";
import { MediaHeaderComponent } from "./features/match/MediaHeader/MediaHeader.component";

export function App() {
  const matchStatus = useAppSelector((state) => state.match.status);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (matchStatus === "idle") {
      const urlParams = new URLSearchParams(window.location.search);
      const matchId = Number(urlParams.get("id"));
      dispatch(fetchMatchById(matchId));
    }
  }, [matchStatus, dispatch]);
  return (
    <>
      <MediaHeaderComponent />
      <MediaPlayerComponent />
    </>
  );
}
