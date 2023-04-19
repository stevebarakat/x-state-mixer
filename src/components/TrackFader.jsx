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
    let track1volume = [];
    let track2volume = [];
    let track3volume = [];
    let track4volume = [];
    let track5volume = [];
    let track6volume = [];
    let track7volume = [];
    let track8volume = [];

    loop.current = new Loop(() => {
      if (state.context.track.playbackMode[trackIndex].volume !== "record")
        return;

      async function record() {
        const time = t.seconds.toFixed(1);
        const switcher = {
          1: async () => {
            track1volume = [{ time, volume }, ...track1volume];
            await db.mixData.put({
              id: "track1",
              track1volume,
            });
          },
          2: async () => {
            track2volume = [{ time, volume }, ...track2volume];
            await db.mixData.put({
              id: "track2",
              track2volume,
            });
          },
          3: async () => {
            track3volume = [{ time, volume }, ...track3volume];
            await db.mixData.put({
              id: "track3",
              track3volume,
            });
          },
          4: async () => {
            track4volume = [{ time, volume }, ...track4volume];
            await db.mixData.put({
              id: "track4",
              track4volume,
            });
          },
          5: async () => {
            track5volume = [{ time, volume }, ...track5volume];
            await db.mixData.put({
              id: "track5",
              track5volume,
            });
          },
          6: async () => {
            track6volume = [{ time, volume }, ...track6volume];
            await db.mixData.put({
              id: "track6",
              track6volume,
            });
          },
          7: async () => {
            track7volume = [{ time, volume }, ...track7volume];
            await db.mixData.put({
              id: "track7",
              track7volume,
            });
          },
          8: async () => {
            track8volume = [{ time, volume }, ...track8volume];
            await db.mixData.put({
              id: "track8",
              track8volume,
            });
          },
          default: () => null,
        };

        (switcher[trackIndex + 1] || switcher.default)();
      }
      record();
    }, 0.1).start(0);

    return () => {
      loop.current.dispose();
    };
  }, [
    trackIndex,
    currentTracks,
    channel.volume,
    mixData,
    loop,
    volume,
    state.context.track.playbackMode,
  ]);

  // !!! --- START PLAYBACK --- !!! //
  useEffect(() => {
    if (!mixData) return;

    function assignVolume(trackIndex, mix) {
      t.schedule((time) => {
        if (state.context.track.playbackMode[trackIndex].volume !== "playback")
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
