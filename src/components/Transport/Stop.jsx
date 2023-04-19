import { MixerMachineContext } from "../../App";
import Button from "../Button";
import { restart } from "../../assets/icons";

function Stop() {
  const [, send] = MixerMachineContext.useActor();

  return (
    <Button
      onClick={() => {
        send("STOP");
      }}
    >
      {restart}
    </Button>
  );
}

export default Stop;
