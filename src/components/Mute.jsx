import { MixerMachineContext } from "../App";

function Mute({ trackIndex, channel }) {
  const [state, send] = MixerMachineContext.useActor();
  const mute = state.context.track.mutes[trackIndex];

  return (
    <div className="chan-strip-btn">
      <input
        id={`trackMute${trackIndex}`}
        type="checkbox"
        onChange={(e) => {
          send({
            type: "TOGGLE_MUTE",
            target: e.target,
            channel,
          });
        }}
        checked={mute}
      />
      <label className="label" htmlFor={`trackMute${trackIndex}`}>
        M
      </label>
    </div>
  );
}

export default Mute;
