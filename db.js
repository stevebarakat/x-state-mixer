import Dexie from "dexie";

export const db = new Dexie("mixerDb");
db.version(1).stores({
  track1: "++id, volume, pan, solo, mute",
  track2: "++id, volume, pan, solo, mute",
  track3: "++id, volume, pan, solo, mute",
  track4: "++id, volume, pan, solo, mute",
  track5: "++id, volume, pan, solo, mute",
  track6: "++id, volume, pan, solo, mute",
  track7: "++id, volume, pan, solo, mute",
  track8: "++id, volume, pan, solo, mute",
});

const dbStores = db._storeNames;

// Populate with data:
db.on("ready", function (db) {
  dbStores.forEach((storeName) => {
    db[`${storeName}`].count(function (count) {
      if (count > 0) {
        return console.log(`Already populated`);
      } else {
        console.log("Database is empty. Populating with default data...");

        const data = [
          { id: "volume", time: 0, value: -32 },
          { id: "pan", time: 0, value: 0 },
          { id: "solo", time: 0, value: false },
          { id: "mute", time: 0, value: false },
        ];

        return db[`${storeName}`].bulkAdd(data);
      }
    });
  });
});

// Queued until data finished populating:
dbStores.forEach((storeName) => {
  db[`${storeName}`]
    .each(function (obj) {
      // Log objects, limit to 100 characters.
      console.log(`Found object: ${JSON.stringify(obj).substring(0, 100)}`);
    })
    .then(function () {
      console.log("Finished.");
    })
    .catch(function (error) {
      console.error(error.stack || error);
    });
});
