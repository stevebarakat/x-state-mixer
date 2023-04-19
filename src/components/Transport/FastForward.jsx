import { MixerMachineContext } from "../../App";
import Button from "../Button";
import { ff } from "../../assets/icons";

export function FastForward() {
  const [, send] = MixerMachineContext.useActor();

  return (
    <Button
      onClick={() => {
        send("FF");
      }}
    >
      {ff}
    </Button>
  );
}
