import { MixerMachineContext } from "../App";

function Solo({ trackIndex, channel }) {
  const [state, send] = MixerMachineContext.useActor();
  const solo = state.context.solos[trackIndex];

  return (
    <>
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
      <label htmlFor={`trackSolo${trackIndex}`}>S</label>
    </>
  );
}

export default Solo;
