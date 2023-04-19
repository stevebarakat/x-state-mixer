import { Destination } from "tone";
import { MixerMachineContext } from "../App";
import Range from "./Range";

function MasterFader({ channel, trackIndex }) {
  const [state, send] = MixerMachineContext.useActor();

  return (
    <>
      <div className="window">
        {`${state.context.masterVolume.toFixed(0)} dB`}
      </div>
      <Range
        id="master"
        className="range-y"
        min={-100}
        max={12}
        step={0.1}
        value={state.context.masterVolume}
        onChange={(e) => {
          send({
            type: "CHANGE_MASTER_VOLUME",
            target: e.target,
            channel: Destination,
          });
        }}
      />
    </>
  );
}

export default MasterFader;
