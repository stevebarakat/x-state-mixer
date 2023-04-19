import { useEffect, useRef, useCallback, useState } from "react";
import { Transport as t } from "tone";
import { formatMilliseconds } from "../../utils";

function Clock({ song }) {
  const requestRef = useRef(null);
  const [clock, setClock] = useState("0:0:0");

  // make sure song stops at end
  if (song.end !== null && song.start !== null) {
    if (t.seconds > song.end) {
      t.stop();
      t.seconds = song.start;
    }
  }

  const animateClock = useCallback(() => {
    requestRef.current = requestAnimationFrame(animateClock);
    setClock(formatMilliseconds(t.seconds));
  }, []);

  useEffect(() => {
    requestAnimationFrame(animateClock);

    return () => {
      if (requestRef.current === null) return;
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="clock">
      <div className="ghost">88:88:88</div>
      {clock}
    </div>
  );
}

export default Clock;
