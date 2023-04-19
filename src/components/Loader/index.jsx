import { MixerMachineContext } from "../../App";
import { loaded } from "tone";
import "./styles.css";

const Spinner = ({ song }) => {
  const [, send] = MixerMachineContext.useActor();

  loaded().then(() => send("LOADED"));

  return (
    <div className="loader">
      <span>
        Loading: {song.artist} - {song.title}
      </span>
      <div className="spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default Spinner;
