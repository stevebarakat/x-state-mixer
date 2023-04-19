import Dexie from "dexie";

export const db = new Dexie("mixerDb");
db.version(1).stores({
  mixData:
    "&id, track1volume, track2volume, track3volume, track4volume, track5volume, track6volume, track7volume, track8volume",
});
