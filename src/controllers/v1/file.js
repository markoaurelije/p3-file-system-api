const { Router } = require("express");
const { ValidationError, ForeignKeyConstraintError } = require("sequelize");
const models = require("../../models").models;

const router = Router();
const { File } = models;

router
  .get("/", async (req, res, next) => {
    const name = req.query.name;
    const parent = req.query.parent;
    const limit = parseInt(req.query.limit);

    const files = await File.findWithName({ name, parent, limit });
    return res.status(200).send(files.map((file) => file.toJSON()));
  })

  .post("/", async (req, res, next) => {
    const { name, parentId } = req.body;
    if (!name) return res.status(406).send({ success: false, message: "Name required" });

    try {
      const newFile = await File.create({ name, parentId: parentId || null });
      return res.status(201).send(newFile.toJSON());
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
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(406).send({ success: false, message: "File not found!" }).send();

    try {
      await file.destroy();
    } catch (e) {
      return res.status(500).send({ success: false, message: e.message });
    }

    return res.status(204).send();
  });

module.exports = router;
