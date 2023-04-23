export function getSong(defaultSong) {
  const defaultSongString = JSON.stringify(defaultSong);
  let sourceSong = JSON.parse(localStorage.getItem("sourceSong")!);
  let currentTracks = JSON.parse(localStorage.getItem("currentTracks")!);
  if (!sourceSong) {
    localStorage.setItem("sourceSong", defaultSongString);
    sourceSong = defaultSong;
  }

  if (!currentTracks) {
    localStorage.setItem("currentTracks", JSON.stringify(defaultSong.tracks));
    currentTracks = defaultSong.tracks;
  }

  return [sourceSong, currentTracks];
}
