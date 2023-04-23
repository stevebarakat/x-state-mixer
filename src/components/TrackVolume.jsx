import { MixerMachineContext } from "../App";
import Range from "./Range";
import PlaybackMode from "./PlaybackMode";
import { useRef, useEffect } from "react";
import { Loop, Transport as t } from "tone";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";

function TrackVolume({ channel, trackIndex }) {
  const [state, send] = MixerMachineContext.useActor();
  const volume = parseFloat(state.context.volumes[trackIndex]);
  const recordLoop = useRef(null);
  const playbackLoop = useRef(null);
  const currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  const data = useLiveQuery(() => db[`track${trackIndex + 1}`].toArray());

  // !!! --- RECORD --- !!! //
  useEffect(() => {
    recordLoop.current = new Loop(() => {
      if (currentTracks[trackIndex].playbackMode.volume !== "record") return;
      send({
        type: "RECORD",
        id: "volume",
        trackIndex,
        value: volume,
      });
    }, 0.1).start(0);

    return () => {
      recordLoop.current.dispose();
    };
  }, [send, trackIndex, currentTracks, volume]);

  // !!! --- PLAYBACK --- !!! //
  useEffect(() => {
    playbackLoop.current = new Loop(() => {
      send({
        type: "PLAYBACK",
        id: "volume",
        trackIndex,
        channel,
        data,
      });
    }, 0.1).start(0);

    return () => {
      playbackLoop.current.dispose();
    };
  }, [send, trackIndex, data, channel]);

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
      <PlaybackMode trackIndex={trackIndex} id="volume" />
    </>
  );
}

export default TrackVolume;
