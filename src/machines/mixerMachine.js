import { createMachine, assign } from "xstate";
import { pure } from "xstate/lib/actions";
import { Destination, Draw, Transport as t } from "tone";
import { dBToPercent, scale } from "../utils/scale";
import { db } from "../../db";
import { roxanne } from "../songs";

let param1 = [];
let param2 = [];
let param3 = [];
let param4 = [];
let param5 = [];
let param6 = [];
let param7 = [];
let param8 = [];

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
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWAPMAnAxAJQFEBlAgFQG0AGAXUVAAcB7WVAF1UYDs6R1EAWAKwA2AHT8AHJX7CJAdkEAaEAE9EAWgCMmuaOGVBM+YIC+J5Wky5CAdQCSAOQAiVWkhBMW7LjzUItCsp8CHKUAJyignISmgBMpuYgltg4AGKprjyebBzc7n4BSryIoRFRMfFmFhgpAMIAEgCCDgDiBAD6AGoA8gAyAKoAsgSZ7tneeaAFOkXBpZHRcQnVVjgNzW3tg41EpAR4XX1DIzRZzDk++RozQSXhCxXLSTW4660dAArNowznE77XQLFEL3cpLKrPVakbotFq9DpEPrdH4eP65AH+G7A+ZgyqJZK4aGw+Fbfp7FHjdFXTFAuagxZ4lbYUQAG0YAEMIKhOFAcL1uo0nAQXKcxmjLqBgpoJLFRABmSiUBlFaYSMRhQRy8H4l6iegs9kqbm8j69RoATQAQo1agBpCniybAyjKPyUCEEvUGo08nBffokB1eKmSxCxSjCV2IHSUB7aplYL2G434Ai1bp4EVuX7BiXAuVywTiKKULXxKMIWI6USxORy-hyhQe3WwViMej0SB+s3moMXJ3BKty0SacKNlWIOVq0R1htNnVWUSt9udiBrJrvdqmi3Wu1bbpCvv-dyDzTD0dhccV-hhfiiR5mRKcRgQOA8AlnXMDjSSCvqWt3kIZZPJ6bKcsan79jwwSSHoZ6xI8f7SuqmrxpCzL6smPKQceoYIC6qiTnId4gS2bYdpAOEhsCOgSOIYT6JeQIFLe97RGEEZ4mYQA */
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

      record: assign(async (context, { trackIndex, value, param }) => {
        const time = t.seconds.toFixed(1);
        const switcher = {
          1: async () => {
            param1 = [{ time, [`${param}`]: value }, ...param1];
            await db.mixData.put({
              id: "track1",
              [`track1${param}`]: param1,
            });
          },
          2: async () => {
            param2 = [{ time, [`${param}`]: value }, ...param2];
            await db.mixData.put({
              id: "track2",
              [`track2${param}`]: param2,
            });
          },
          3: async () => {
            param3 = [{ time, [`${param}`]: value }, ...param3];
            await db.mixData.put({
              id: "track3",
              [`track3${param}`]: param3,
            });
          },
          4: async () => {
            param4 = [{ time, [`${param}`]: value }, ...param4];
            await db.mixData.put({
              id: "track4",
              [`track4${param}`]: param4,
            });
          },
          5: async () => {
            param5 = [{ time, [`${param}`]: value }, ...param5];
            await db.mixData.put({
              id: "track5",
              [`track5${param}`]: param5,
            });
          },
          6: async () => {
            param6 = [{ time, [`${param}`]: value }, ...param6];
            await db.mixData.put({
              id: "track6",
              [`track6${param}`]: param6,
            });
          },
          7: async () => {
            param7 = [{ time, [`${param}`]: value }, ...param7];
            await db.mixData.put({
              id: "track7",
              [`track7${param}`]: param7,
            });
          },
          8: async () => {
            param8 = [{ time, [`${param}`]: value }, ...param8];
            await db.mixData.put({
              id: "track8",
              [`track8${param}`]: param8,
            });
          },
          default: () => null,
        };
        (switcher[trackIndex + 1] || switcher.default)();
      }),

      playback: assign((context, { trackIndex, channel, mixData, param }) => {
        if (!mixData) return;
        console.log("mixData", mixData);
        function assignParam(trackIndex, mix) {
          t.schedule((time) => {
            if (
              currentTracks[trackIndex].playbackMode[`${param}`] !== "playback"
            )
              return;
            Draw.schedule(() => {
              channel[`${param}`].value = mix[`${param}`];
              context.track[`${param}s`][trackIndex] = mix[`${param}`];
            }, time);
          }, mix.time);
        }

        switch ((trackIndex + 1).toString()) {
          case "1":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track1${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "2":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track2${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "3":
            console.log("db", db);
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track3${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "4":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track4${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "5":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track5${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "6":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track6${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "7":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track7${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          case "8":
            currentTracks[trackIndex].playbackMode[`${param}`] === "playback" &&
              mixData[trackIndex][`track8${param}`]?.forEach((mix) => {
                assignParam(trackIndex, mix);
              });
            break;
          default:
            break;
        }
      }),
    },
  }
);
