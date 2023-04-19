import Clock from "./Clock";
import Stop from "./Stop";
import Rewind from "./Rewind";
import { FastForward as FF } from "./FastForward";
import Play from "./Play";

const Transport = ({ song }) => (
  <div className="flex gap12">
    <div className="flex gap4">
      <Stop />
      <Rewind />
      <Play />
      <FF />
    </div>
    <Clock song={song} />
  </div>
);

export default Transport;
