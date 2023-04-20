import { MixerMachineContext } from "../../App";
import Button from "../Button";
import { restart } from "../../assets/icons";

function Reset() {
  const [, send] = MixerMachineContext.useActor();

  return (
    <Button
      onClick={() => {
        send("RESET");
      }}
    >
      {restart}
    </Button>
  );
}

export default Reset;
