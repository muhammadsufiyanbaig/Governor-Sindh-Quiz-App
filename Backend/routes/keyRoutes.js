const express = require("express");
const { getCurrentKey, validateKey } = require("../controllers/keyController");
const router = express.Router();

router.get("/testkey", getCurrentKey);
router.post("/testkey", validateKey);

module.exports = router;
