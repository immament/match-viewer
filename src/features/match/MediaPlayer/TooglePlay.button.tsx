import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "/app/withTypes";
import { selectPaused, tooglePlay } from "../match.slice";

export function TooglePlayButton() {
  const paused = useAppSelector(selectPaused);
  const dispatch = useAppDispatch();

  const iconCss = useMemo(() => {
    return paused ? "bx bx-play" : "bx bx-pause";
  }, [paused]);

  const onClick = () => {
    dispatch(tooglePlay());
  };

  return (
    <button className="mv-play-control" onClick={onClick} title="Play">
      <i className={iconCss}></i>
    </button>
  );
}
