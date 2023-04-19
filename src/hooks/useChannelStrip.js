import { useEffect, useRef } from "react";
import { Channel, Player, Transport as t, Destination } from "tone";

function useChannelStrip({ tracks }) {
  const channels = useRef([]);
  const players = useRef([]);

  useEffect(() => {
    for (let i = 0; i < tracks.length; i++) {
      channels.current = channels.current && [
        ...channels.current,
        new Channel({ volume: 0 }),
      ];
      players.current = players.current && [
        ...players.current,
        new Player(tracks[i].path),
      ];
    }

    players.current?.forEach((player, i) => {
      channels.current &&
        player.chain(channels.current[i], Destination).sync().start("+0.5");
    });

    return () => {
      t.stop();
      players.current?.forEach((player, i) => {
        player.disconnect();
        channels.current && channels.current[i].disconnect();
      });
      players.current = [];
      channels.current = [];
    };
  }, [tracks]);

  return [channels];
}

export default useChannelStrip;
