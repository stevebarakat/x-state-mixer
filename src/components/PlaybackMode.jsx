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
        id={`record-${param}-${trackIndex}`}
        name={`pbm-${param}-${trackIndex}`}
        value="record"
        onChange={changePlaybackMode}
        checked={playbackMode === "record"}
      />
      <label htmlFor={`record-${param}-${trackIndex}`}>R</label>

      <input
        type="radio"
        id={`playback-${param}-${trackIndex}`}
        name={`pbm-${param}-${trackIndex}`}
        value="playback"
        onChange={changePlaybackMode}
        checked={playbackMode === "playback"}
      />
      <label htmlFor={`playback-${param}-${trackIndex}`}>P</label>

      <input
        type="radio"
        id={`static-${param}-${trackIndex}`}
        name={`pbm-${param}-${trackIndex}`}
        value="static"
        onChange={changePlaybackMode}
        checked={playbackMode === "static"}
      />
      <label htmlFor={`static-${param}-${trackIndex}`}>S</label>
    </div>
  );
}

export default PlaybackMode;
