import { Destination } from "tone";
import MasterFader from "./MasterFader";

function Master() {
  return (
    <div className="channel">
      <MasterFader trackIndex="master" channel={Destination} />
      <span>Master</span>
    </div>
  );
}

export default Master;
