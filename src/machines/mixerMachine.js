import { createMachine, assign } from "xstate";
import { pure } from "xstate/lib/actions";
import { Destination, Draw, Transport as t } from "tone";
import { transpose } from "../utils/scale";
import { dBToPercent, scale } from "../utils/scale";
import { db } from "../../db";
import { roxanne } from "../songs";

let track1volume = [];
let track2volume = [];
let track3volume = [];
let track4volume = [];
let track5volume = [];
let track6volume = [];
let track7volume = [];
let track8volume = [];

const getSong = () => {
  let song = JSON.parse(localStorage.getItem("song"));
  let currentTracks = JSON.parse(localStorage.getItem("currentTracks"));
  if (!song || !currentTracks) {
    localStorage.setItem("song", JSON.stringify(roxanne));
    localStorage.setItem("currentTracks", JSON.stringify(roxanne.tracks));
    song = roxanne;
    currentTracks = roxanne.tracks;
  }
  return [song, currentTracks];
};
const [song, currentTracks] = getSong();

const savedVolumes = currentTracks.map((currentTrack) => currentTrack.volume);
const savedPans = currentTracks.map((currentTrack) => currentTrack.pan);
const savedMutes = currentTracks.map((currentTrack) => currentTrack.mute);
const savedSolos = currentTracks.map((currentTrack) => currentTrack.solo);
const savedPlaybackModes = currentTracks.map(
  (currentTrack) => currentTrack.playbackMode
);

export const mixerMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrADge1WQDoAbPdCAS0ygGIAZAeQEEARAUVYG0AGAXUSh8sSskp5MgkAA9EAWgAsRAEzKAbAFY1yjQBoQAT0QBmHsqIaAvpf1osuAsRwl0B6nQAKzAKoBldrwCSCDCouKSwbIImkQAjLEA7LEAHAl6hiaa1rYY2PiERM6u7rS+ACqMHoFSoWISUlEx8Ump6UYICsoJFtkgdnmOhS5uNLQASuwA6gCSAHLc-DV4InURoI0acYkpafrtCgCcPL39DgVFI3QAYoxjk8xjrHMA4tXBteENiE3brXuIGgOySIPASyViOhOuTOTmGJQAwgAJZizZ7sAD6ADVGPRvABZAKLd7LML1SLfTbNHZtRAJHhqOJaSE2PrQ-Kw4qjJEotHoryzN5CEmrL7RSm-XYZBDgpTKYwKYxpKH2dmFdAAV1gkFoHnozAAmoKQsLPuSxURksoeMYITSEAdVEQbcycirBjgNVqIKUKlUiUKVqb1hSLVbnXagUpwS7WW6CrBkHgcDhtbqDUaPmTgwgEuZVJptHbYjwFN1w9YWZg8BA4FJTuyloGszJ5ClgclLdGixpzFYWfXBmQKO5G6S1i2EDx-ghlApjv22e64TRRyKzXJYnOLZ3bdOFcplQNzp7IKugxON1uO8ou9OtAy+66j8QE0mUxAz82opeeNub7upTpWIK0sIA */
    id: "mixer",
    initial: "loading",
    context: {
      masterVolume: -32,
      track: {
        volumes: savedVolumes,
        pans: savedPans,
        solos: savedSolos,
        mutes: savedMutes,
        playbackModes: savedPlaybackModes,
      },
    },
    on: {
      RESET: { actions: "reset", target: "stopped" },
      REWIND: { actions: "rewind" },
      FF: { actions: "fastForward" },
      CHANGE_VOLUME: { actions: "changeVolume" },
      CHANGE_MASTER_VOLUME: { actions: "changeMasterVolume" },
      CHANGE_PAN: { actions: "changePan" },
      TOGGLE_SOLO: { actions: "toggleSolo" },
      TOGGLE_MUTE: { actions: "toggleMute" },
      PLAYBACK: { actions: "playback" },
    },

    states: {
      loading: { on: { LOADED: "stopped" } },
      playing: {
        on: {
          PAUSE: { actions: "pause", target: "stopped" },
          RECORD: { actions: "record" },
        },
      },
      stopped: {
        on: {
          PLAY: { actions: "play", target: "playing" },
          CHANGE_PLAYBACK_MODE: { actions: "changePlaybackMode" },
        },
      },
    },
    predictableActionArguments: true,
  },

  {
    actions: {
      play: () => t.start(),
      pause: () => t.pause(),
      reset: () => {
        t.stop();
        t.seconds = song.start ?? 0;
      },
      fastForward: () =>
        (t.seconds =
          t.seconds < song.end - 10 ? t.seconds + 10 : (t.seconds = song.end)),
      rewind: () =>
        (t.seconds = t.seconds > 10 + song.start ? t.seconds - 10 : 0),

      changeMasterVolume: pure((_, { target }) => {
        const scaled = dBToPercent(scale(parseFloat(target.value)));
        const volume = () => {
          Destination.volume.value = scaled;
        };
        return [assign({ masterVolume: parseFloat(target.value) }), volume];
      }),

      changeVolume: pure((context, { target, channel }) => {
        const trackIndex = target.id.at(-1);
        const value = target.value;
        const scaled = dBToPercent(scale(parseFloat(value)));
        const channelVolume = () => {
          channel.volume.value = scaled;
        };
        const tempVols = context.track.volumes;
        tempVols[trackIndex] = parseFloat(value);
        currentTracks[trackIndex].volume = parseFloat(value);
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ volume: tempVols }), channelVolume];
      }),

      changePan: pure((context, { target, channel }) => {
        const trackIndex = target.id.at(-1);
        const value = target.value;
        const channelPan = () => {
          channel.pan.value = value;
        };
        const tempPans = context.track.pans;
        tempPans[trackIndex] = parseFloat(value);
        currentTracks[trackIndex].pan = parseFloat(value);
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ pan: tempPans }), channelPan];
      }),

      toggleMute: pure((context, { target, channel }) => {
        const trackIndex = target.id.at(-1);
        const checked = target.checked;
        const muteChannel = () => {
          channel.mute = checked;
        };
        const tempMutes = context.track.mutes;
        tempMutes[trackIndex] = checked;
        currentTracks[trackIndex].mute = target.checked;
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ mute: tempMutes }), muteChannel];
      }),

      toggleSolo: pure((context, { target, channel }) => {
        const trackIndex = target.id.at(-1);
        const checked = target.checked;
        const soloChannel = () => {
          channel.solo = checked;
        };
        const tempSolos = context.track.solos;
        tempSolos[trackIndex] = checked;
        currentTracks[trackIndex].solo = target.checked;
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ solo: tempSolos }), soloChannel];
      }),

      changePlaybackMode: pure((context, { param, target }) => {
        const trackIndex = target.id.at(-1);
        const value = target.value;
        const tempPlaybackModes = context.track.playbackModes;
        tempPlaybackModes[trackIndex] = value;
        currentTracks[trackIndex].playbackMode[`${param}`] = target.value;
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ playbackMode: tempPlaybackModes })];
      }),

      record: assign(async (context, { trackIndex, volume }) => {
        const time = t.seconds.toFixed(1);
        const switcher = {
          1: async () => {
            track1volume = [{ time, volume }, ...track1volume];
            await db.mixData.put({
              id: "track1",
              track1volume,
            });
          },
          2: async () => {
            track2volume = [{ time, volume }, ...track2volume];
            await db.mixData.put({
              id: "track2",
              track2volume,
            });
          },
          3: async () => {
            track3volume = [{ time, volume }, ...track3volume];
            await db.mixData.put({
              id: "track3",
              track3volume,
            });
          },
          4: async () => {
            track4volume = [{ time, volume }, ...track4volume];
            await db.mixData.put({
              id: "track4",
              track4volume,
            });
          },
          5: async () => {
            track5volume = [{ time, volume }, ...track5volume];
            await db.mixData.put({
              id: "track5",
              track5volume,
            });
          },
          6: async () => {
            track6volume = [{ time, volume }, ...track6volume];
            await db.mixData.put({
              id: "track6",
              track6volume,
            });
          },
          7: async () => {
            track7volume = [{ time, volume }, ...track7volume];
            await db.mixData.put({
              id: "track7",
              track7volume,
            });
          },
          8: async () => {
            track8volume = [{ time, volume }, ...track8volume];
            await db.mixData.put({
              id: "track8",
              track8volume,
            });
          },
          default: () => null,
        };
        (switcher[trackIndex + 1] || switcher.default)();
      }),

      playback: assign((context, { trackIndex, channel, mixData }) => {
        console.log("mixData2", mixData);

        function assignVolume(trackIndex, mix) {
          t.schedule((time) => {
            if (currentTracks[trackIndex].playbackMode.volume !== "playback")
              return;
            Draw.schedule(() => {
              console.log("mix.volume", mix.volume);
              console.log("context", context.track.volumes[trackIndex]);
              channel.volume.value = mix.volume;
              context.track.volumes[trackIndex] = mix.volume;
            }, time);
          }, mix.time);
        }

        const switcher = {
          1: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track1volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          2: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track2volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          3: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track3volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          4: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track4volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          5: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track5volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          6: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track6volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          7: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track7volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          8: () => {
            mixData[trackIndex] &&
              mixData[trackIndex][`track8volume`]?.forEach((mix) => {
                assignVolume(trackIndex, mix);
              });
          },
          default: () => console.log("Unknown"),
        };

        (switcher[(trackIndex + 1).toString()] || switcher.default)();
      }),
    },
  }
);
