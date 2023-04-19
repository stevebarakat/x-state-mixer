import { MixerMachineContext } from "../App";

function PlaybackMode({ trackIndex }) {
  const [state, send] = MixerMachineContext.useActor();

  const playbackMode = state.context.track.playbackModes[trackIndex];

  console.log("playbackMode", playbackMode);

  function changePlaybackMode(e) {
    send({
      type: "CHANGE_PLAYBACK_MODE",
      param: "volume",
      target: e.target,
    });
  }

  console.log("trackIndex", trackIndex);

  return (
    <div>
      <input
        type="radio"
        id={`record-${trackIndex}`}
        name={`playbackMode-${trackIndex}`}
        value="record"
        onChange={changePlaybackMode}
        defaultChecked={playbackMode.volume === "record"}
      />
      <label htmlFor={`record-${trackIndex}`}>R</label>

      <input
        type="radio"
        id={`playback-${trackIndex}`}
        name={`playbackMode-${trackIndex}`}
        value="playback"
        onChange={changePlaybackMode}
        defaultChecked={playbackMode.volume === "playback"}
      />
      <label htmlFor={`playback-${trackIndex}`}>P</label>

      <input
        type="radio"
        id={`free-${trackIndex}`}
        name={`playbackMode-${trackIndex}`}
        value="free"
        onChange={changePlaybackMode}
        defaultChecked={playbackMode.volume === "free"}
      />
      <label htmlFor={`free-${trackIndex}`}>F</label>
    </div>
  );
}

export default PlaybackMode;
