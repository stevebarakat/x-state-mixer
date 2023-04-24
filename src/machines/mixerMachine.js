import { createMachine, assign } from "xstate";
import { pure } from "xstate/lib/actions";
import { start, getContext, Destination, Draw, Transport as t } from "tone";
import { dBToPercent, scale } from "../utils/scale";
import { db } from "../../db";
import { getSong } from "../utils/getSong";
import { roxanne } from "../songs";

const context = getContext();
const [song, currentTracks] = getSong(roxanne);
const initialVolumes = currentTracks.map((currentTrack) => currentTrack.volume);
const initialPans = currentTracks.map((currentTrack) => currentTrack.pan);
const initialMutes = currentTracks.map((currentTrack) => currentTrack.mute);
const initialSolos = currentTracks.map((currentTrack) => currentTrack.solo);
const initialPlaybackModes = currentTracks.map(
  (currentTrack) => currentTrack.playbackMode
);
let data = [];

export const mixerMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWAPMAnAxAJQFEBlAgFQG0AGAXUVAAcB7WVAF1UYDs6R1EAWAKwA2AHT8AHJX7CJAdkEAaEAE9EAWgCMmuaOGVBM+YIC+J5Wky5CAdQCSAOQAiVWkhBMW7LjzUItCsp8CHKUAJyignISmgBMpuYgltg4AGKprjyebBzc7n4BSryIoRFRMfFmFhgpAMIAEgCCDgDiBAD6AGoA8gAyAKoAsgSZ7tneeaAFOkXBpZHRcQnVVjgNzW3tg41EpAR4XX1DIzRZzDk++RozQSXhCxXLSTW4660dAArNowznE77XQLFEL3cpLKrPVakbotFq9DpEPrdH4eP65AH+G7A+ZgyqJZK4aGw+Fbfp7FHjdFXTFAuagxZ4lbYUQAG0YAEMIKhOFAcL1uo0nAQXKcxmjLqBgpoJLFRABmSiUBlFaYSMRhQRy8H4l6iegs9kqbm8j69RoATQAQo1agBpCniybAyjKPyUCEEvUGo08nBffokB1eKmSxCxSjCV2IHSUB7aplYL2G434Ai1bp4EVuX7BiXAuVywTiKKULXxKMIWI6USxORy-hyhQe3WwViMej0SB+s3moMXJ3BKty0SacKNlWIOVq0R1htNnVWUSt9udiBrJrvdqmi3Wu1bbpCvv-dyDzTD0dhccV-hhfiiR5mRKcRgQOA8AlnXMDjSSCvqWt3kIZZPJ6bKcsan79jwwSSHoZ6xI8f7SuqmrxpCzL6smPKQceoYIC6qiTnId4gS2bYdpAOEhsCOgSOIYT6JeQIFLe97RGEEZ4mYQA */
    id: "mixer",
    initial: "loading",
    context: {
      mainVolume: -32,
      volumes: initialVolumes,
      pans: initialPans,
      solos: initialSolos,
      mutes: initialMutes,
      playbackModes: initialPlaybackModes,
    },
    on: {
      RESET: { actions: "reset", target: "stopped" },
      REWIND: { actions: "rewind" },
      FF: { actions: "fastForward" },
      CHANGE_VOLUME: { actions: "changeVolume" },
      CHANGE_MAIN_VOLUME: { actions: "changeMainVolume" },
      CHANGE_PAN: { actions: "changePan" },
      TOGGLE_SOLO: { actions: "toggleSolo" },
      TOGGLE_MUTE: { actions: "toggleMute" },
    },

    states: {
      loading: { on: { LOADED: "stopped" } },
      playing: {
        on: {
          PAUSE: { actions: "pause", target: "stopped" },
          RECORD: { actions: "record" },
          PLAYBACK: { actions: "playback" },
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
      play: () => {
        if (context.state === "suspended") {
          start(); // initialize audio context
          t.start();
        } else {
          t.start();
        }
      },
      pause: () => t.pause(),
      reset: () => {
        t.stop();
        t.seconds = song.start ?? 0;
      },
      fastForward: () =>
        (t.seconds =
          t.seconds < song.end - 10 ? t.seconds + 10 : (t.seconds = song.end)),
      rewind: () =>
        (t.seconds = t.seconds > 10 + song.start ? t.seconds - 10 : song.start),

      changeMainVolume: pure((_, { target }) => {
        const scaled = dBToPercent(scale(parseFloat(target.value)));
        const volume = () => {
          Destination.volume.value = scaled;
        };
        return [assign({ mainVolume: parseFloat(target.value) }), volume];
      }),

      changeVolume: pure((context, { target, channel }) => {
        const trackIndex = target.id.at(-1);
        const value = target.value;
        const scaled = dBToPercent(scale(parseFloat(value)));
        const channelVolume = () => {
          channel.volume.value = scaled;
        };
        const tempVols = context.volumes;
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
        const tempPans = context.pans;
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
        const tempMutes = context.mutes;
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
        const tempSolos = context.solos;
        tempSolos[trackIndex] = checked;
        currentTracks[trackIndex].solo = target.checked;
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ solo: tempSolos }), soloChannel];
      }),

      changePlaybackMode: pure((context, { id, target }) => {
        const trackIndex = target.id.at(-1);
        const value = target.value;
        const tempPlaybackModes = context.playbackModes;
        tempPlaybackModes[trackIndex] = value;
        currentTracks[trackIndex].playbackMode[`${id}`] = target.value;
        localStorage.setItem(
          "currentTracks",
          JSON.stringify([...currentTracks])
        );
        return [assign({ playbackMode: tempPlaybackModes })];
      }),

      record: assign((context, { trackIndex, value, id }) => {
        const time = t.seconds.toFixed(1);
        const switcher = {
          1: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          2: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          3: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          4: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          5: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          6: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          7: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          8: async () => {
            data = [{ time, value }, ...data];
            await db[`track${trackIndex + 1}`].put({ id, data });
          },
          default: () => null,
        };
        (switcher[trackIndex + 1] || switcher.default)();
      }),

      playback: assign((context, { trackIndex, channel, trackData, id }) => {
        if (!trackData) return;
        function assignParam(trackIndex, data) {
          t.schedule((time) => {
            if (currentTracks[trackIndex].playbackMode[`${id}`] !== "playback")
              return;

            Draw.schedule(() => {
              channel[`${id}`].value = data.value;
              context[`${id}s`][trackIndex] = data.value;
            }, time);
          }, data.time);
        }

        switch ((trackIndex + 1).toString()) {
          case "1":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "2":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "3":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              // console.log("trackData", trackData[0]);
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "4":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "5":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "6":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "7":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          case "8":
            currentTracks[trackIndex].playbackMode[`${id}`] === "playback" &&
              trackData[0].data?.forEach((data) => {
                assignParam(trackIndex, data);
              });
            break;
          default:
            break;
        }
      }),
    },
  }
);
