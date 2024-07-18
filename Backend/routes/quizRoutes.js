const express = require("express");
const { getQuiz, submitQuiz } = require("../controllers/quizController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/quizData", authenticate, getQuiz);
router.post("/quiz", authenticate, submitQuiz);

module.exports = router;
