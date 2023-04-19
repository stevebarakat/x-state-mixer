import { MixerMachineContext } from "../../App";
import Button from "../Button";
import { rew } from "../../assets/icons";

function Rewind() {
  const [, send] = MixerMachineContext.useActor();

  return (
    <Button
      onClick={() => {
        send("REWIND");
      }}
    >
      {rew}
    </Button>
  );
}

export default Rewind;
