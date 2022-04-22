const { Router } = require("express");
const { ValidationError, ForeignKeyConstraintError } = require("sequelize");
const models = require("../../models").models;

const router = Router();
const { Folder } = models;

router
  .get("/", async (req, res, next) => {
    const folders = await Folder.findAll();
    return res.status(200).send(folders.map((folder) => folder.toJSON()));
  })

  .post("/", async (req, res, next) => {
    const { name, parentId } = req.body;
    if (!name) return res.status(406).send({ success: false, message: "Name required" });

    try {
      const newFolder = await Folder.create({ name, parentId: parentId || null });
      return res.status(201).send(newFolder.toJSON());
    } catch (error) {
      let status = 500;
      let message = error.message;
      if (error instanceof ValidationError) {
        status = 406;
      } else if (error instanceof ForeignKeyConstraintError) {
        status = 406;
        message = "parent folder not found";
      }
      return res.status(status).send({ success: false, message });
    }
  })
  .delete("/:id", async (req, res, next) => {
    const folder = await Folder.findByPk(req.params.id);
    if (!folder)
      return res.status(406).send({ success: false, message: "Folder not found!" }).send();

    await folder.destroy();

    return res.status(204).send();
  });

module.exports = router;
