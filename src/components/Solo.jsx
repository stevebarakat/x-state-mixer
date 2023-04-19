import { MixerMachineContext } from "../App";

function Solo({ trackIndex, channel }) {
  const [state, send] = MixerMachineContext.useActor();
  const solo = state.context.track.solo[trackIndex];

  return (
    <div className="chan-strip-btn">
      <input
        id={`trackSolo${trackIndex}`}
        type="checkbox"
        onChange={(e) => {
          send({
            type: "TOGGLE_SOLO",
            target: e.target,
            channel,
          });
        }}
        checked={solo}
      />
      <label className="label" htmlFor={`trackSolo${trackIndex}`}>
        S
      </label>
    </div>
  );
}

export default Solo;
