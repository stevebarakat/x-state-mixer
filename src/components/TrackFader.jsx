import { useRef, useEffect } from "react";
import { Loop, Transport as t } from "tone";
import { MixerMachineContext } from "../App";
import Range from "./Range";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";

function TrackFader({ channel, trackIndex }) {
  const [state, send] = MixerMachineContext.useActor();
  const recordLoop = useRef(null);
  const playbackLoop = useRef(null);
  const currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  const volume = parseFloat(state.context.track.volumes[trackIndex]);

  const mixData = useLiveQuery(() => db.mixData.toArray());

  // !!! --- START RECORDING --- !!! //
  useEffect(() => {
    recordLoop.current = new Loop(() => {
      if (currentTracks[trackIndex].playbackMode.volume !== "record") return;
      send({
        type: "RECORD",
        param: "volume",
        trackIndex,
        volume,
      });
    }, 0.1).start(0);

    return () => {
      recordLoop.current.dispose();
    };
  }, [send, trackIndex, currentTracks, volume]);

  // !!! --- START PLAYBACK --- !!! //
  useEffect(() => {
    if (!mixData) return;

    playbackLoop.current = new Loop(() => {
      send({
        type: "PLAYBACK",
        param: "volume",
        trackIndex,
        channel,
        mixData,
      });
    }, 0.1).start(0);

    return () => {
      playbackLoop.current.dispose();
    };
  }, [trackIndex, mixData, channel, send]);

  return (
    <>
      <div className="window">{`${volume.toFixed(0)} dB`}</div>
      <Range
        id={`trackVol${trackIndex}`}
        className="range-y"
        min={-100}
        max={12}
        step={0.1}
        value={volume}
        onChange={(e) => {
          send({
            type: "CHANGE_VOLUME",
            target: e.target,
            channel,
          });
        }}
      />
    </>
  );
}

export default TrackFader;
