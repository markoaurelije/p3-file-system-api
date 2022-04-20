const helper = require("../test-helper");
const { models } = require("../../src/models");
var File, Folder;

describe("File", () => {
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
    it("Should succeed to create a new file in root folder (parent == null)", async () => {
      // const { File, Folder } = models;
      const filename = "test";
      const data = { name: filename };
      const newFile = await File.createNewFile(data);

      // console.log(newFile);
      expect(newFile.id).toBeDefined();
      expect(newFile.name).toEqual(filename);
      expect(newFile.parentId).toBeNull();

      // console.log((await File.findByPk(1, { include: File.parent })).toJSON());
    });

    it("Should be able to create a new file with parent set", async () => {
      // const { File } = models;
      const filename = "test";
      const parent = "root";
      const data = { name: filename, parent: { name: parent } };
      const newFile = await File.createNewFile(data);

      expect(newFile.id).toBeDefined();
      expect(newFile.name).toEqual(filename);
      expect(newFile.parentId).not.toBeNull();
      expect(newFile.parent).not.toBeNull();
      expect(newFile.parent.name).toEqual(parent);

      // console.log((await File.findByPk(1, { include: File.parent })).toJSON());
    });

    it("Should be able to set parent (move file to another parent)", async () => {
      // const { File, Folder } = models;
      const filename = "test";
      const data = { name: filename };
      const newFile = await File.createNewFile(data);

      expect(newFile.id).toBeDefined();
      expect(newFile.name).toEqual(filename);
      expect(newFile.parentId).toBeNull();

      const newFolder = await Folder.createNewFolder({ name: "some folder" });
      await newFile.setParent(newFolder);

      expect(newFile.name).toEqual(filename);
      expect(newFile.parentId).not.toBeNull();
      expect(newFile.parentId).toEqual(newFolder.id);

      // console.log(newFile.toJSON());
    });

    it("should be able to delete a file", async function () {
      // const { File } = models;
      const newFile = await helper.createNewFile();

      const id = newFile.id;
      await newFile.destroy();

      const findFile = await File.findByPk(id);

      expect(findFile).toBeNull();
    });
  });

  describe("Validation", () => {
    it("should fail when file name contains invalid character", async () => {
      let error;
      try {
        await File.create({ name: "contain star*" });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].path).toEqual("name");
      expect(error.errors[0].message).toEqual("'name' contains invalid character(s)");
    });

    it("should fail to create 1st level file with existing name (parent is null)", async () => {
      await File.create({ name: "root-file" });

      let error;
      try {
        await File.create({ name: "root-file" });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].path).toEqual("name");
      expect(error.errors[0].message).toEqual("Filename already exists along this path");
    });

    it("should fail to create sub-folder with existing name", async () => {
      const rootFolder = await Folder.createNewFolder({ name: "root" });

      await File.create({
        name: "file001",
        parentId: rootFolder.id,
      });

      let error;
      try {
        await File.create({ name: "file001", parentId: rootFolder.id });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.length).toEqual(1);
      expect(error.errors[0].path).toEqual("name");
      expect(error.errors[0].message).toEqual("Filename already exists along this path");
    });
  });
});
