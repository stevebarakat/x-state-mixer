import { useState } from "react";
import { Mixer } from "./components/Mixer";
import { justDance, roxanne, aDayInTheLife, blueMonday } from "./songs";
import { createActorContext } from "@xstate/react";
import { mixerMachine } from "./machines/mixerMachine";

// export const song = roxanne;
export const MixerMachineContext = createActorContext(mixerMachine);

function App() {
  const [song, setSong] = useState(() =>
    JSON.parse(localStorage.getItem("sourceSong"))
  );

  function onChange(e) {
    let currentTracks = [];
    switch (e.target.value) {
      case "roxanne":
        localStorage.setItem("song", JSON.stringify(roxanne));
        currentTracks = roxanne.tracks;
        currentTracks.forEach((currentTrack) => {
          currentTrack["volume"] = -32;
          currentTrack["pan"] = 0;
          currentTrack["mute"] = false;
          currentTrack["solo"] = false;
        });
        localStorage.setItem("currentTracks", JSON.stringify(currentTracks));
        window.location.reload();
        setSong(roxanne);
        break;
      case "aDayInTheLife":
        localStorage.setItem("song", JSON.stringify(aDayInTheLife));
        currentTracks = aDayInTheLife.tracks;
        currentTracks.forEach((currentTrack) => {
          currentTrack["volume"] = -32;
          currentTrack["pan"] = 0;
          currentTrack["mute"] = false;
          currentTrack["solo"] = false;
        });
        localStorage.setItem("currentTracks", JSON.stringify(currentTracks));
        window.location.reload();
        setSong(aDayInTheLife);
        break;
      case "blueMonday":
        localStorage.setItem("song", JSON.stringify(blueMonday));
        currentTracks = blueMonday.tracks;
        currentTracks.forEach((currentTrack) => {
          currentTrack["volume"] = -32;
          currentTrack["pan"] = 0;
          currentTrack["mute"] = false;
          currentTrack["solo"] = false;
        });
        localStorage.setItem("currentTracks", JSON.stringify(currentTracks));
        window.location.reload();
        setSong(blueMonday);
        break;
      case "justDance":
        localStorage.setItem("song", JSON.stringify(justDance));
        currentTracks = justDance.tracks;
        currentTracks.forEach((currentTrack) => {
          currentTrack["volume"] = -32;
          currentTrack["pan"] = 0;
          currentTrack["mute"] = false;
          currentTrack["solo"] = false;
        });
        localStorage.setItem("currentTracks", JSON.stringify(currentTracks));
        window.location.reload();
        setSong(justDance);
        break;

      default:
        break;
    }
  }

  return (
    <>
      <MixerMachineContext.Provider value={song}>
        <Mixer song={song} />
      </MixerMachineContext.Provider>
      <select name="songs" id="song-select" onChange={onChange}>
        <option value="">Choose a song:</option>
        <option value="roxanne">The Police - Roxanne</option>
        <option value="aDayInTheLife">The Beatles - A Day In The Life</option>
        <option value="blueMonday">New Order - Blue Monday</option>
        <option value="justDance">Lady Gaga - Just Dance</option>
      </select>
    </>
  );
}

export default App;
