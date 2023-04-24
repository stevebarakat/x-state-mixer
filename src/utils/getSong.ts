export function getSong(defaultSong) {
  const defaultSongString = JSON.stringify(defaultSong);
  let song = JSON.parse(localStorage.getItem("song")!);
  let currentTracks = JSON.parse(localStorage.getItem("currentTracks")!);
  if (!song) {
    localStorage.setItem("song", defaultSongString);
    song = defaultSong;
  }

  if (!currentTracks) {
    localStorage.setItem("currentTracks", JSON.stringify(defaultSong.tracks));
    currentTracks = defaultSong.tracks;
  }

  return [song, currentTracks];
}
