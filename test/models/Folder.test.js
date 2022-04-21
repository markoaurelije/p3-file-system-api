const helper = require("../test-helper");
const { models } = require("../../src/models");
var File, Folder;

describe("Folder model", () => {
  beforeAll(async () => {
    await helper.startDb();
    ({ File, Folder } = models);
  });

  afterAll(async () => {
    await helper.stopDb();
  });

  beforeEach(async () => {
    await helper.syncDb();
  });

  describe("Creation and deletion", () => {
    it("Should succeed to create a new folder in root (parent == null)", async () => {
      const folderName = "folder0";
      const data = { name: folderName };
      const newFolder = await Folder.create(data);

      expect(newFolder.id).toBeDefined();
      expect(newFolder.name).toEqual(folderName);
      expect(newFolder.path).toEqual("/" + folderName);
      expect(newFolder.parentId).toBeNull();
      expect(await newFolder.getFiles()).toEqual([]);
      // console.log((await File.findByPk(1, { include: File.parent })).toJSON());
    });

    it("Should be able to set folder parent (move to another parent)", async () => {
      const parentFolder = await Folder.create({
        name: "some other folder",
      });
      expect(parentFolder.path).toEqual("/some other folder");
      const folderName = "test folder";
      const data = { name: folderName };
      const myFolder = await Folder.create(data);

      expect(myFolder.id).toBeDefined();
      expect(myFolder.name).toEqual(folderName);
      expect(myFolder.path).toEqual("/" + folderName);
      expect(myFolder.parentId).toBeNull();

      // await myFolder.setParent(parentFolder);  // for some reason, this call is not update-ing DB
      await myFolder.update({ parentId: parentFolder.id });
      expect(myFolder.name).toEqual(folderName);
      expect(myFolder.path).toEqual(parentFolder.path + "/" + folderName);
      expect(myFolder.parentId).not.toBeNull();
      expect(myFolder.parentId).toEqual(parentFolder.id);
      // await myFolder.save();

      // console.log(newFile.toJSON());
    });

    it("should be able to delete a folder", async function () {
      const newFolder = await helper.createNewFolder();

      const id = newFolder.id;
      await newFolder.destroy();

      const findFolder = await Folder.findByPk(id);

      expect(findFolder).toBeNull();
    });

    it("should fail to delete when child files exist", async () => {
      const rootFolder = await helper.createNewFolder();
      await rootFolder.createFile({ name: "file1" });

      let error;
      try {
        await rootFolder.destroy();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
    });

    it("should fail to delete when child folder exist", async () => {
      const rootFolder = await helper.createNewFolder();
      await rootFolder.createFolder({ name: "folder2" });

      let error;
      try {
        await rootFolder.destroy();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
    });
  });

  describe("Validation", () => {
    it("should fail when file name contains invalid character", async () => {
      let error;
      try {
        await Folder.create({ name: "contain iv@l!d char" });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].path).toEqual("name");
      expect(error.errors[0].message).toEqual("'name' contains invalid character(s)");
    });

    it("should fail to create 1st level folder with existing name (parent is null)", async () => {
      await Folder.create({ name: "root-folder" });

      let error;
      try {
        await Folder.create({ name: "root-folder" });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].path).toEqual("name");
      expect(error.errors[0].message).toEqual("Folder name already exists along this path");
    });

    it("should fail to create sub-folder with existing name", async () => {
      const rootFolder = await Folder.create({ name: "root" });

      await Folder.create({
        name: "folder01",
        parentId: rootFolder.id,
      });

      let error;
      try {
        await Folder.create({ name: "folder01", parentId: rootFolder.id });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].path).toEqual("name");
      expect(error.errors[0].message).toEqual("Folder name already exists along this path");
    });
  });
});
