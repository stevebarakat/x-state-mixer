import useChannelStrip from "../hooks/useChannelStrip";
import Transport from "./Transport";
import Loader from "./Loader";
import ChannelStrip from "./ChannelStrip";
import { MixerMachineContext } from "../App";
import MainVolume from "./MainVolume";

export const Mixer = ({ song }) => {
  const tracks = song.tracks;
  const [state] = MixerMachineContext.useActor();
  const [channels] = useChannelStrip({ tracks });

  return state.value === "loading" ? (
    <Loader song={song} />
  ) : (
    <div className="mixer">
      <div>
        {song.artist} - {song.title}
      </div>
      <div className="channels">
        {tracks.map((track, i) => (
          <ChannelStrip
            key={track.path}
            track={track}
            trackIndex={i}
            channel={channels.current[i]}
          />
        ))}
        <MainVolume />
      </div>
      <Transport song={song} />
    </div>
  );
};
