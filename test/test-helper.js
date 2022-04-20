require("../src/config");
const Database = require("../src/database");
const dbConfig = require("../src/config/database");

let db;

module.exports = class TestHelpers {
  static async startDb() {
    db = new Database("test", dbConfig);
    await db.connect();
    return db;
  }

  static async stopDb() {
    await db.disconnect();
  }

  static async syncDb() {
    await db.sync();
  }

  static async createNewFile(name, parent = null) {
    const { File } = require("../src/models").models;
    const filename = name || "fileName.txt";
    const data = { name: filename, parent };
    return await File.createNewFile(data);
  }

  static async createNewFolder(name, parent = null) {
    const { Folder } = require("../src/models").models;
    const folderName = name || "folder name 01";
    const data = { name: folderName, parent };
    return await Folder.createNewFolder(data);
  }

  // static getApp() {
  //   const App = require("../src/app").default;
  //   return new App().getApp();
  // }
};
