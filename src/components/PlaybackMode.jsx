import { MixerMachineContext } from "../App";

function PlaybackMode({ trackIndex, id }) {
  const [, send] = MixerMachineContext.useActor();

  function changePlaybackMode(e) {
    send({
      type: "CHANGE_PLAYBACK_MODE",
      target: e.target,
      id,
    });
  }

  const currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  const playbackMode = currentTracks[trackIndex].playbackMode[`${id}`];

  return (
    <div className="pbm-btn">
      <input
        type="radio"
        id={`record-${id}-${trackIndex}`}
        name={`pbm-${id}-${trackIndex}`}
        value="record"
        onChange={changePlaybackMode}
        checked={playbackMode === "record"}
      />
      <label htmlFor={`record-${id}-${trackIndex}`}>R</label>

      <input
        type="radio"
        id={`playback-${id}-${trackIndex}`}
        name={`pbm-${id}-${trackIndex}`}
        value="playback"
        onChange={changePlaybackMode}
        checked={playbackMode === "playback"}
      />
      <label htmlFor={`playback-${id}-${trackIndex}`}>P</label>

      <input
        type="radio"
        id={`static-${id}-${trackIndex}`}
        name={`pbm-${id}-${trackIndex}`}
        value="static"
        onChange={changePlaybackMode}
        checked={playbackMode === "static"}
      />
      <label htmlFor={`static-${id}-${trackIndex}`}>S</label>
    </div>
  );
}

export default PlaybackMode;
