require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { generateToken } = require("./middleware/jwtUtils");
const authenticate = require("./middleware/authMiddleware");
const app = express();
const PORT = process.env.PORT || 5001;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const quizData = require("./quizData.json");
const { neon } = require("@neondatabase/serverless");
const sql = neon(
  `postgresql://neondb_owner:iWK6s9ImyHgV@ep-steep-art-a5nfu9wr.us-east-2.aws.neon.tech/GIAIC_Quiz?sslmode=require`
);

app.use(cookieParser());

async function getPgVersion() {
  const result = await sql`SELECT version()`;
  console.log(result[0]);
}
getPgVersion();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());
app.use(bodyParser.json());

// Create the users table if it doesn't exist
async function createTables() {
  // Create users table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      score INTEGER
    )
  `;

  // Create faculty table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS faculty (
      id SERIAL PRIMARY KEY,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `;

  // Create keys table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS keys (
      id SERIAL PRIMARY KEY,
      key TEXT,
      generated_at TIMESTAMP
    )
  `;

  // Create quizzes table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS typescriptQuiz (
      id SERIAL PRIMARY KEY,
      question TEXT,
      options TEXT[],
      correctAnswer TEXT[]
    )
  `;

}

createTables();
 
app.post("/signup",  async (req, res) => {
  const { fullName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "You already exist" });
    }

    await sql`
      INSERT INTO users (fullName, email, password) VALUES (${fullName}, ${email}, ${hashedPassword})
    `;
    const token = generateToken({ email });
    res.json({ message: "User signed up successfully", token });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
 
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      id: user[0].id,
      fullName: user[0].fullName,
      email: user[0].email,
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    return res.json({ msg: "success", id: user[0].id });
  } catch (error) {
    console.error("Error while comparing passwords:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/logout", authenticate, async (req, res) => {
  res.cookie("token", "", { expires: new Date(0), httpOnly: true });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
});

app.post("/signup-faculty", async (req, res) => {
  const { fullName, email, password, key } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const keyCode = "GIAIC_FACULTY_2024";
  try {
    const existingUser =
      await sql`SELECT * FROM faculty WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Faculty member already exists" });
    }
    if (keyCode === key) {
      await sql`
  INSERT INTO faculty (fullName, email,password) VALUES (${fullName}, ${email}, ${hashedPassword})`;
    }     
    const token = generateToken({ email });
    res.json({ message: "Faculty member signed up successfully", token });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/login-faculty", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const faculty = await sql`SELECT * FROM faculty WHERE email = ${email}`;
    if (faculty.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, faculty[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken({
      id: faculty[0].id,
      fullName: faculty[0].fullName,
      email: faculty[0].email,
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    return res.json({ msg: "success", id: faculty[0].id });
  } catch (error) {
    console.error("Error while comparing passwords:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


const keyGenerator = (function () {
  let prefix = "giaic-q1";
  let year = new Date().getFullYear();
  let currentKey = null;
  let timer = null;

  async function saveKeyToDatabase(key) {
    try {
      await sql`
        INSERT INTO keys (key, generated_at) VALUES (${key}, ${getCurrentTimeFormatted()})
      `;
    } catch (error) {
      console.error("Error saving key to database:", error);
    }
  }

  function generateRandomKey() {
    const randomString = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${randomString}-${year}`;
  }

  async function updateKey() {
    currentKey = generateRandomKey();
    console.log(`New Key Generated: ${currentKey}`);
    await saveKeyToDatabase(currentKey);
  }

  function startKeyGeneration() {
    updateKey();
    timer = setInterval(() => {
      updateKey();
    }, 60 * 60 * 1000);
  }

  function stopKeyGeneration() {
    if (timer) {
      clearInterval(timer);
    }
  }

  function getCurrentKey() {
    return currentKey;
  }

  return {
    start: startKeyGeneration,
    stop: stopKeyGeneration,
    getCurrentKey: getCurrentKey,
  };
})();

keyGenerator.start();

function getCurrentTimeFormatted() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
app.get("/testkey", async (req, res) => {
  const initialKey = keyGenerator.getCurrentKey();
  res.json({ initialKey });
});
app.post("/faculty", authenticate, async (req, res) => {
  const { id } = req.body;
  // console.log(id);
  try {
    const faculty = await sql`SELECT * FROM faculty WHERE id = ${id}`;
    // console.log(faculty);
    
    if (faculty.length === 0) {
      return res.status(404).json({ error: "Faculty member not found" });
    }
    res.json(faculty[0]);
  } catch (error) {
    console.error("Error fetching faculty member:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/testkey", async (req, res) => {
  const userKey = req.body.key;
  const userId = req.body.userId;
  console.log(userId);

  const initialKey = keyGenerator.getCurrentKey();
  if (userKey === initialKey) {
    res.json({ success: true, message: "Key is valid" });
  } else {
    res.json({ success: false, message: "Key is invalid" });
  }
});

app.get("/quiz", authenticate, async (req, res) => {
  const result = await sql`SELECT id, question, options, correctanswer FROM typescriptQuiz`;
  // console.log(result);
  // Format the result into the desired structure
  const quizData = result.map(row => ({
    id: row.id,
    question: row.question,
    options: row.options,
    correctAnswer: row.correctanswer
  }));
  const frontendQuizData = quizData.map(
    ({ id, question, options, correctAnswer }) => ({
      id,
      question,
      options,
      answersQuantity: correctAnswer.length < 2 ? "single" : "multiple",
    })
  );
  const shuffledQuiz = shuffleArray([...frontendQuizData]);
  const shuffled = shuffledQuiz.slice(0, 5);
  const timestamp = new Date().toISOString();
  res.json({ questions: shuffled, timestamp });
});

app.post("/quiz", authenticate, async (req, res) => {
  try {
    const { userResponses } = req.body;
    const { user } = req.body;
    let score = 0;

    userResponses.forEach(({ questionId, userAnswer }) => {
      const currentQuestion = quizData.find((q) => q.id === questionId);
      if (!currentQuestion) {
        throw new Error("Invalid question ID");
      }

      const correctAnswers = currentQuestion.correctAnswer;
      if (
        userAnswer &&
        userAnswer.length === correctAnswers.length &&
        userAnswer.every((ans) => correctAnswers.includes(ans))
      ) {
        score++;
      }
    });

    await sql`
      UPDATE users
      SET score = ${score}
      WHERE id = ${user}
    `;

    res.json({ success: true, score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
