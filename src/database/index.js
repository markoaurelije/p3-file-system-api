const cls = require("cls-hooked");
const { Sequelize } = require("sequelize");
const { registerModels } = require("../models/");

module.exports = class Database {
  constructor(environment, dbConfig) {
    this.environment = environment;
    this.dbConfig = dbConfig;
    this.isTestEnvironment = this.environment === "test";
  }

  async connect() {
    // Set up the namespace for transactions
    const namespace = cls.createNamespace("tx-namespace");
    Sequelize.useCLS(namespace);

    // Create the connection
    const { username, password, host, port, database, dialect } =
      this.dbConfig[this.environment];
    this.connection = new Sequelize({
      username,
      password,
      host,
      port,
      database,
      dialect,
      logging: this.isTestEnvironment ? false : console.log,
    });

    // Check if we connected successfully
    await this.connection.authenticate({ logging: false });

    if (!this.isTestEnvironment) {
      console.log("DB connection successful.");
    }

    // Register the models
    registerModels(this.connection);

    // Sync the models
    await this.sync();
  }

  async disconnect() {
    await this.connection.close();
  }

  async sync() {
    await this.connection.sync({
      logging: false,
      force: this.isTestEnvironment,
    });

    if (!this.isTestEnvironment) {
      console.log("DB Connection synced.");
    }
  }
};
