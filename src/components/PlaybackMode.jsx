import { MixerMachineContext } from "../App";

function PlaybackMode({ trackIndex, param }) {
  const [, send] = MixerMachineContext.useActor();

  function changePlaybackMode(e) {
    send({
      type: "CHANGE_PLAYBACK_MODE",
      target: e.target,
      param,
    });
  }

  const currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  const playbackMode = currentTracks[trackIndex].playbackMode[`${param}`];

  return (
    <div className="pbm-btn">
      <input
        type="radio"
        id={`record-${trackIndex}`}
        name={`playbackMode-${trackIndex}`}
        value="record"
        onChange={changePlaybackMode}
        checked={playbackMode === "record"}
      />
      <label htmlFor={`record-${trackIndex}`}>R</label>

      <input
        type="radio"
        id={`playback-${trackIndex}`}
        name={`playbackMode-${trackIndex}`}
        value="playback"
        onChange={changePlaybackMode}
        checked={playbackMode === "playback"}
      />
      <label htmlFor={`playback-${trackIndex}`}>P</label>

      <input
        type="radio"
        id={`free-${trackIndex}`}
        name={`playbackMode-${trackIndex}`}
        value="free"
        onChange={changePlaybackMode}
        checked={playbackMode === "free"}
      />
      <label htmlFor={`free-${trackIndex}`}>F</label>
    </div>
  );
}

export default PlaybackMode;
