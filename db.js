import Dexie from "dexie";

export const db = new Dexie("mixerDb");
db.version(1).stores({
  track1: "++id, volume, pan, solo, mute",
  track2: "++id, volume, pan, solo, mute",
  track3: "++id, volume, pan, solo, mute",
  track4: "++id, volume, pan, solo, mute",
});

const dbIds = db._storeNames;

// Populate with data:
db.on("ready", function (db) {
  dbIds.forEach((id) => {
    db[`${id}`].count(function (count) {
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

        return db[`${id}`].bulkAdd(data);
      }
    });
  });
});

// Following operation will be queued until we're finished populating data:
dbIds.forEach((id) => {
  db[`${id}`]
    .each(function (obj) {
      // When we come here, data is fully populated and we can log all objects.
      console.log(`Found object: ` + JSON.stringify(obj));
    })
    .then(function () {
      console.log("Finished.");
    })
    .catch(function (error) {
      console.error(error.stack || error);
    });
});
