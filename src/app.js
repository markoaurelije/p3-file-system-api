const express = require("express");
const environment = require("./config/environment");
const logger = require("morgan");
const { v1Routes } = require("./controllers");

module.exports = class App {
  constructor() {
    this.app = express();
    this.app.use(logger("dev", { skip: (req, res) => environment.nodeEnv === "test" }));
    this.app.use(express.json());
    // this.app.use(express.urlencoded({ extended: true }));
    this.setRoutes();
  }

  setRoutes() {
    this.app.use("/v1", v1Routes);
  }

  getApp() {
    return this.app;
  }

  listen() {
    const { port } = environment;
    this.app.listen(port, () => {
      console.log(`Listening at port ${port}`);
    });
  }
};
