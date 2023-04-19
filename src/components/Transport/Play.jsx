import { MixerMachineContext } from "../../App";
import Button from "../Button";
import { play, pause } from "../../assets/icons";

function Play() {
  const [state, send] = MixerMachineContext.useActor();

  return (
    <Button
      onClick={() => {
        if (!state.matches("playing")) {
          send("PLAY");
        }
        if (state.matches("playing")) {
          send("PAUSE");
        }
      }}
    >
      {!state.matches("playing") ? play : pause}
    </Button>
  );
}

export default Play;
