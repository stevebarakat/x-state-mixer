import Pan from "./Pan";
import Solo from "./Solo";
import Mute from "./Mute";
import PlaybackMode from "./PlaybackMode";
import TrackFader from "./TrackFader";

function ChannelStrip({ track, trackIndex, channel }) {
  return (
    <div className="channel">
      <div className="flex">
        <Solo trackIndex={trackIndex} channel={channel} />
        <Mute trackIndex={trackIndex} channel={channel} />
      </div>
      <Pan trackIndex={trackIndex} channel={channel} />
      <TrackFader trackIndex={trackIndex} channel={channel} />
      <PlaybackMode trackIndex={trackIndex} />
      <span>{track.name}</span>
    </div>
  );
}

export default ChannelStrip;
