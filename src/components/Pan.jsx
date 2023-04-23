import { MixerMachineContext } from "../App";
import Range from "./Range";
import PlaybackMode from "./PlaybackMode";
import { useRef, useEffect } from "react";
import { Loop, Transport as t } from "tone";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";

function Pan({ trackIndex, channel }) {
  const [state, send] = MixerMachineContext.useActor();
  const pan = parseFloat(state.context.pans[trackIndex]);
  const recordLoop = useRef(null);
  const playbackLoop = useRef(null);
  const currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  // const mixData = useLiveQuery(() => db.mixData.toArray());

  // // !!! --- RECORD --- !!! //
  // useEffect(() => {
  //   recordLoop.current = new Loop(() => {
  //     if (currentTracks[trackIndex].playbackMode.pan !== "record") return;
  //     send({
  //       type: "RECORD",
  //       id: "pan",
  //       value: pan,
  //       trackIndex,
  //     });
  //   }, 0.1).start(0);

  //   return () => {
  //     recordLoop.current.dispose();
  //   };
  // }, [send, trackIndex, currentTracks, pan]);

  // // !!! --- PLAYBACK --- !!! //
  // useEffect(() => {
  //   playbackLoop.current = new Loop(() => {
  //     send({
  //       type: "PLAYBACK",
  //       id: "pan",
  //       trackIndex,
  //       channel,
  //       mixData,
  //     });
  //   }, 0.1).start(0);

  //   return () => {
  //     playbackLoop.current.dispose();
  //   };
  // }, [send, trackIndex, mixData, channel]);

  return (
    <>
      <Range
        id={trackIndex}
        min={-1}
        max={1}
        step={0.01}
        className="range-x"
        value={pan}
        onChange={(e) => {
          send({
            type: "CHANGE_PAN",
            target: e.target,
            channel,
          });
        }}
      />
      <PlaybackMode trackIndex={trackIndex} id="pan" />
    </>
  );
}

export default Pan;
