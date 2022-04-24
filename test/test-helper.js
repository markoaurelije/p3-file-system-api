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
    let parentId = null;
    if (parent) {
      parentId = (await Folder.create({ name: parent })).id;
    }
    return await Folder.create({ name: folderName, parentId });
  }

  static async createTestDataSet() {
    const { File, Folder } = require("../src/models").models;
    let folders = ["src", "test"];
    let files = [
      ["index.js", "file.js", "folder.js"],
      ["index.test.js", "file.test.js", "folder.test.js"],
    ];

    for (let i = 0; i < folders.length; i++) {
      await Folder.create({ name: folders[i] });
    }

    for (let i = 0; i < files[0].length; i++) {
      await File.create({ name: files[0][i], parentId: 1 });
    }

    for (let i = 0; i < files[1].length; i++) {
      await File.create({ name: files[1][i], parentId: 2 });
    }
  }

  static getApp() {
    const App = require("../src/app");
    return new App().getApp();
  }
};
