import { useState, useRef, useEffect } from "react";
import { dBToPercent, transpose } from "../utils/scale";
import { Draw, Loop, Transport as t } from "tone";
import { MixerMachineContext } from "../App";
import Range from "./Range";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";

function TrackFader({ channel, trackIndex }) {
  const [state, send] = MixerMachineContext.useActor();
  const loop = useRef(null);
  const currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  const volume = parseFloat(state.context.track.volumes[trackIndex]);

  const mixData = useLiveQuery(() => db.mixData.toArray());

  // !!! --- START RECORDING --- !!! //
  useEffect(() => {
    loop.current = new Loop(() => {
      if (currentTracks[trackIndex].playbackMode.volume !== "record") return;
      send({
        type: "RECORD",
        trackIndex,
        volume,
      });
    }, 0.1).start(0);

    return () => {
      loop.current.dispose();
    };
  }, [send, trackIndex, currentTracks, volume]);

  // !!! --- START PLAYBACK --- !!! //
  useEffect(() => {
    if (!mixData) return;

    function assignVolume(trackIndex, mix) {
      t.schedule((time) => {
        if (currentTracks[trackIndex].playbackMode.volume !== "playback")
          return;
        Draw.schedule(() => {
          const scaled = dBToPercent(transpose(mix.volume));
          channel.volume.value = scaled;
          state.context.volume[trackIndex] = mix.volume;
        }, time);
      }, mix.time);
    }

    const switcher = {
      1: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track1volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      2: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track2volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      3: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track3volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      4: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track4volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      5: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track5volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      6: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track6volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      7: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track7volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      8: () => {
        mixData[trackIndex] &&
          mixData[trackIndex][`track8volume`]?.forEach((mix) => {
            assignVolume(trackIndex, mix);
          });
      },
      default: () => console.log("Unknown"),
    };

    (switcher[(trackIndex + 1).toString()] || switcher.default)();
  }, [
    trackIndex,
    mixData,
    currentTracks,
    channel.volume,
    state.context.volume,
    state.context.track.playbackMode,
  ]);

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
