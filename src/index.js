require("./config");
const Database = require("./database");
const environment = require("./config/environment");
const dbConfig = require("./config/database");

const retryTimer = parseInt(process.env.APP_RETRY_TIMER) || 30;

function tryToStartApp() {
  const db = new Database(environment.nodeEnv, dbConfig);
  db.connect()
    .then(() => {
      const App = require("./app");
      const app = new App();
      app.listen();
    })
    .catch((err) => {
      console.error("Failed to connect with DB...\n", err.message);
      console.error(`Will retry in ${retryTimer} seconds...\n`);
      setTimeout(tryToStartApp, retryTimer * 1000);
    });
}

tryToStartApp();
