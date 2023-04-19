import { MixerMachineContext } from "../App";

function PlaybackMode({ trackIndex }) {
  const [state, send] = MixerMachineContext.useActor();

  const playbackMode = state.context.track.playbackModes.volumePbm;

  console.log("playbackMode", playbackMode);

  function changePlaybackMode(e) {
    send({
      type: "CHANGE_PLAYBACK_MODE",
      target: e.target,
    });
  }

  return (
    <div>
      <input
        type="radio"
        id={`record-${trackIndex}`}
        name="playbackMode"
        value="record"
        onChange={changePlaybackMode}
        checked={playbackMode === "record"}
      />
      <label htmlFor={`record-${trackIndex}`}>R</label>

      <input
        type="radio"
        id={`playback-${trackIndex}`}
        name="playbackMode"
        value="playback"
        onChange={changePlaybackMode}
        checked={playbackMode === "playback"}
      />
      <label htmlFor={`playback-${trackIndex}`}>P</label>

      <input
        type="radio"
        id={`free-${trackIndex}`}
        name="playbackMode"
        value="free"
        onChange={changePlaybackMode}
        checked={playbackMode === "free"}
      />
      <label htmlFor={`free-${trackIndex}`}>F</label>
    </div>
  );
}

export default PlaybackMode;
