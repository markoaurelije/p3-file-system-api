const helper = require("../../test-helper");
const models = require("../../../src/models").models;
const request = require("supertest");

describe("File controller", () => {
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
    it("should list all files", async () => {
      await helper.createNewFile();
      const response = await request(app).get("/v1/files").expect(200);
      expect(response.body.length).toEqual(1);
    });

    it("should return limited number of files based on 'limit' query parameter", async () => {
      await helper.createTestDataSet();
      const response = await request(app).get("/v1/files?limit=3").expect(200);

      expect(response.body.length).toEqual(3);
    });

    it("should search for files based on 'name' query parameter", async () => {
      await helper.createTestDataSet();
      const response = await request(app).get("/v1/files?name=index.").expect(200);

      expect(response.body.length).toEqual(2);

      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "index.js" })])
      );
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "index.test.js" })])
      );
    });

    it("should search for files based on 'name' and 'parent' query parameters", async () => {
      await helper.createTestDataSet();
      const response = await request(app).get("/v1/files?name=index.&parent=src").expect(200);

      expect(response.body.length).toEqual(1);

      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "index.js" })])
      );
    });
  });

  describe("POST method", () => {
    it("should create a new file in root folder", async () => {
      const filename = "filename.txt";
      const response = await request(app).post("/v1/files").send({ name: filename }).expect(201);
      expect(response.body.name).toEqual(filename);
      expect(response.body.path).toEqual("/" + filename);
      expect(response.body.createdAt).toEqual(expect.any(String));
      expect(response.body.updatedAt).toEqual(expect.any(String));
      expect(response.body.parentId).toBeNull();

      const createdFile = await File.unscoped().findByPk(1);
      expect(createdFile.name).toEqual(filename);
      expect(createdFile.path).toEqual("/" + filename);
      expect(createdFile.createdAt).toEqual(expect.any(Date));
      expect(createdFile.updatedAt).toEqual(expect.any(Date));
      expect(createdFile.parentId).toBeNull();
    });

    it("should create a new file in existing folder (level 1)", async () => {
      const folderName = "folder01";
      const folder = await helper.createNewFolder(folderName);

      const filename = "filename.txt";
      const response = await request(app)
        .post("/v1/files")
        .send({ name: filename, parentId: folder.id })
        .expect(201);
      expect(response.body.name).toEqual(filename);
      expect(response.body.path).toEqual("/" + folderName + "/" + filename);
      expect(response.body.createdAt).toEqual(expect.any(String));
      expect(response.body.updatedAt).toEqual(expect.any(String));
      expect(response.body.parentId).toEqual(folder.id);

      const createdFile = await File.unscoped().findByPk(1);
      expect(createdFile.name).toEqual(filename);
      expect(createdFile.path).toEqual("/" + folderName + "/" + filename);
      expect(createdFile.createdAt).toEqual(expect.any(Date));
      expect(createdFile.updatedAt).toEqual(expect.any(Date));
      expect(createdFile.parentId).toEqual(folder.id);
    });

    it("should create a new file in level2 sub-folder", async () => {
      const rootName = "root";
      const subFolderName = "folder001";
      const filename = "image.jpg";

      const subFolder = await helper.createNewFolder(subFolderName, rootName);

      const response = await request(app)
        .post("/v1/files")
        .send({ name: filename, parentId: subFolder.id })
        .expect(201);
      expect(response.body.name).toEqual(filename);
      expect(response.body.path).toEqual("/" + rootName + "/" + subFolderName + "/" + filename);
      expect(response.body.createdAt).toEqual(expect.any(String));
      expect(response.body.updatedAt).toEqual(expect.any(String));
      expect(response.body.parentId).toEqual(subFolder.id);

      const createdFile = await File.unscoped().findByPk(1);
      expect(createdFile.name).toEqual(filename);
      expect(createdFile.path).toEqual("/" + rootName + "/" + subFolderName + "/" + filename);
      expect(createdFile.createdAt).toEqual(expect.any(Date));
      expect(createdFile.updatedAt).toEqual(expect.any(Date));
      expect(createdFile.parentId).toEqual(subFolder.id);
    });

    it("should fail to create a new file without 'name' specified", async () => {
      const response = await request(app).post("/v1/files").send({}).expect(406);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual("Name required");
    });

    it("should fail to create a new file in non-existing folder", async () => {
      await request(app)
        .post("/v1/files")
        .send({ name: "some file name.ext", parentId: 12345 })
        .expect(406);
    });
  });

  describe("DELETE method", () => {
    it("should remove a file from root folder", async () => {
      await helper.createNewFile();
      let filesCount = await File.count({});
      expect(filesCount).toEqual(1);

      await request(app).delete("/v1/files/1").expect(204);
      filesCount = await File.count({});
      expect(filesCount).toEqual(0);
    });

    it("should remove a file from sub-folder", async () => {
      const subFolder = await helper.createNewFolder("sub-folder", "root");
      const file = await File.create({ name: "filename.xyz", parentId: subFolder.id });
      expect(file.path).toEqual("/root/sub-folder/filename.xyz");

      let filesCount = await File.count({});
      expect(filesCount).toEqual(1);

      await request(app).delete("/v1/files/1").expect(204);
      filesCount = await File.count({});
      expect(filesCount).toEqual(0);
    });

    it("should fail to remove a non-existing file", async () => {
      const response = await request(app).delete("/v1/files/1").expect(406);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual("File not found!");
    });
  });
});
