require("./config");
const Database = require("./database");
const environment = require("./config/environment");
const dbConfig = require("./config/database");

(async () => {
  try {
    const db = new Database(environment.nodeEnv, dbConfig);
    await db.connect();
  } catch (err) {
    console.error("Failed to connect with DB...\n", err.message);
  }
})();
