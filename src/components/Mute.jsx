import { MixerMachineContext } from "../App";

function Mute({ trackIndex, channel }) {
  const [state, send] = MixerMachineContext.useActor();
  const mute = state.context.mutes[trackIndex];

  return (
    <>
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
        checked={channel.muted}
      />
      <label htmlFor={`trackMute${trackIndex}`}>M</label>
    </>
  );
}

export default Mute;
