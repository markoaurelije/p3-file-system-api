const { Router } = require("express");
const fileRouter = require("./file");
const folderRouter = require("./folder");

const router = Router();

router.use("/file", fileRouter);
router.use("/folder", folderRouter);

module.exports = router;
