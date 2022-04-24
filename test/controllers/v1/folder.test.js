const helper = require("../../test-helper");
const models = require("../../../src/models").models;
const request = require("supertest");

describe("Folder controller", () => {
  let app;
  let File, Folder;

  beforeAll(async () => {
    await helper.startDb();
    ({ File, Folder } = models);
    app = helper.getApp();
  });

  afterAll(async () => {
    await helper.stopDb();
  });

  beforeEach(async () => {
    await helper.syncDb();
  });

  describe("GET method", () => {
    it("should list all folders", async () => {
      await helper.createNewFolder();
      const response = await request(app).get("/v1/folders").expect(200);
      expect(response.body.length).toEqual(1);
    });
  });

  describe("POST method", () => {
    it("should create a new folder in root folder", async () => {
      const folderName = "My Documents";
      const response = await request(app)
        .post("/v1/folders")
        .send({ name: folderName })
        .expect(201);
      expect(response.body.name).toEqual(folderName);
      expect(response.body.path).toEqual("/" + folderName);
      expect(response.body.createdAt).toEqual(expect.any(String));
      expect(response.body.updatedAt).toEqual(expect.any(String));
      expect(response.body.parentId).toBeNull();

      const createdFolder = await Folder.findByPk(1);
      expect(createdFolder.name).toEqual(folderName);
      expect(createdFolder.path).toEqual("/" + folderName);
      expect(createdFolder.createdAt).toEqual(expect.any(Date));
      expect(createdFolder.updatedAt).toEqual(expect.any(Date));
      expect(createdFolder.parentId).toBeNull();
    });

    it("should create a new folder in existing folder (level 1)", async () => {
      const folderName = "users";
      const folder = await helper.createNewFolder(folderName);

      const subFolderName = "Marko";
      const response = await request(app)
        .post("/v1/folders")
        .send({ name: subFolderName, parentId: folder.id })
        .expect(201);
      expect(response.body.id).toBeGreaterThan(0);
      expect(response.body.name).toEqual(subFolderName);
      expect(response.body.path).toEqual("/" + folderName + "/" + subFolderName);
      expect(response.body.createdAt).toEqual(expect.any(String));
      expect(response.body.updatedAt).toEqual(expect.any(String));
      expect(response.body.parentId).toEqual(folder.id);
      const subFolderId = response.body.id;

      const createdFolder = await Folder.findByPk(subFolderId);
      expect(createdFolder.name).toEqual(subFolderName);
      expect(createdFolder.path).toEqual("/" + folderName + "/" + subFolderName);
      expect(createdFolder.createdAt).toEqual(expect.any(Date));
      expect(createdFolder.updatedAt).toEqual(expect.any(Date));
      expect(createdFolder.parentId).toEqual(folder.id);
    });

    it("should fail to create a new folder without 'name' specified", async () => {
      const response = await request(app).post("/v1/folders").send({}).expect(406);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual("Name required");
    });

    it("should fail to create a new folder in non-existing folder", async () => {
      await request(app)
        .post("/v1/folders")
        .send({ name: "new folder", parentId: 12345 })
        .expect(406);
    });
  });

  describe("DELETE method", () => {
    it("should remove a folder from root folder", async () => {
      await helper.createNewFolder();
      let foldersCount = await Folder.count({});
      expect(foldersCount).toEqual(1);

      await request(app).delete("/v1/folders/1").expect(204);
      foldersCount = await Folder.count({});
      expect(foldersCount).toEqual(0);
    });

    it("should remove a sub-folder", async () => {
      const subFolder = await helper.createNewFolder("sub-folder", "root");

      let foldersCount = await Folder.count({});
      expect(foldersCount).toEqual(2);

      await request(app).delete(`/v1/folders/${subFolder.id}`).expect(204);
      foldersCount = await Folder.count({});
      expect(foldersCount).toEqual(1);
    });

    it("should fail to remove a non-existing folder", async () => {
      const response = await request(app).delete("/v1/folders/1234").expect(406);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual("Folder not found!");
    });

    it("should fail to remove a folder with children", async () => {
      await helper.createTestDataSet();

      const response = await request(app).delete("/v1/folders/1").expect(500);
      expect(response.body.success).toEqual(false);
    });
  });
});
