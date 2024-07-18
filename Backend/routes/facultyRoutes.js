const express = require("express");
const { signupFaculty, loginFaculty, getFaculty } = require("../controllers/facultyController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup-faculty", signupFaculty);
router.post("/login-faculty", loginFaculty);
router.post("/faculty", authenticate, getFaculty);

module.exports = router;
