const { Router } = require("express");
const fileRouter = require("./file");
const folderRouter = require("./folder");

const router = Router();

router.use("/files", fileRouter);
router.use("/folders", folderRouter);

module.exports = router;
