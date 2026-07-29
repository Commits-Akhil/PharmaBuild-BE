const express = require("express");

const router = express.Router();

const { checkStock } = require("./controller");

router.post("/check-stock", checkStock);

module.exports = router;