import { createMachine, assign } from "xstate";
import { pure } from "xstate/lib/actions";
import { Destination, Transport as t } from "tone";
import { dBToPercent, scale } from "../utils/scale";
import { roxanne } from "../songs";

const song = JSON.parse(localStorage.getItem("song")) ?? roxanne;

const currentTracks =
  JSON.parse(localStorage.getItem("currentTracks")) || roxanne.tracks;

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

    states: {
      loading: { on: { LOADED: "stopped" } },
      playing: {
        on: {
          PLAY: { actions: "play", target: "playing" },
          PAUSE: { actions: "pause", target: "stopped" },
          STOP: { actions: "stop", target: "stopped" },
          REWIND: { actions: "rewind" },
          FF: { actions: "fastForward" },
          CHANGE_VOLUME: { actions: "changeVolume" },
          CHANGE_MASTER_VOLUME: { actions: "changeMasterVolume" },
          CHANGE_PAN: { actions: "changePan" },
          TOGGLE_SOLO: { actions: "toggleSolo" },
          TOGGLE_MUTE: { actions: "toggleMute" },
        },
      },
      stopped: {
        on: {
          PLAY: { actions: "play", target: "playing" },
          STOP: { actions: "stop", target: "stopped" },
          LOADED: { actions: "stop", target: "stopped" },
          CHANGE_VOLUME: { actions: "changeVolume" },
          CHANGE_MASTER_VOLUME: { actions: "changeMasterVolume" },
          CHANGE_PAN: { actions: "changePan" },
          TOGGLE_SOLO: { actions: "toggleSolo" },
          TOGGLE_MUTE: { actions: "toggleMute" },
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
      stop: () => {
        t.stop();
        t.seconds = song.start ?? 0;
      },
      fastForward: () => (t.seconds = t.seconds + 10),
      rewind: pure(() => (t.seconds = t.seconds > 10 ? t.seconds - 10 : 0)),

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
    },
  }
);
