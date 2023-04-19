import { MixerMachineContext } from "../App";
import Range from "./Range";

function Pan({ trackIndex, channel }) {
  const [state, send] = MixerMachineContext.useActor();
  const pan = parseFloat(state.context.track.pans[trackIndex]);

  return (
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
  );
}

export default Pan;
