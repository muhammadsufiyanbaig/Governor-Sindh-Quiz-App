require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { generateToken } = require("./middleware/jwtUtils");
const authenticate = require("./middleware/authMiddleware");
const app = express();
const PORT = process.env.PORT || 5001;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const { neon } = require('@neondatabase/serverless');
const sql = neon(`postgresql://neondb_owner:iWK6s9ImyHgV@ep-steep-art-a5nfu9wr.us-east-2.aws.neon.tech/GIAIC_Quiz?sslmode=require`);

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
    credentials: true
  })
);

app.options("*", cors());
app.use(express.json());
app.use(bodyParser.json());

// Create the users table if it doesn't exist
async function createUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      score INTEGER
    )
  `;
}

createUsersTable();

app.post("/signup", async (req, res) => {
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

app.get("/logout", async (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.status(200).json({ success: true, message: 'User logged out successfully' });
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const quizData = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid", "Jeddah"],
    correctAnswer: ["Paris"],
  },
  {
    id: 2,
    question: "Which of the following are primary colors?",
    options: ["Red", "Green", "Blue", "Yellow"],
    correctAnswer: ["Red", "Blue", "Yellow"],
  },
  {
    id: 3,
    question: "Which of the following countries are part of the G7 group?",
    options: ["United States", "China", "Japan", "France"],
    correctAnswer: ["United States", "Japan", "France"],
  },
  {
    id: 4,
    question: "Who wrote 'Romeo and Juliet'?",
    options: [
      "William Shakespeare",
      "Jane Austen",
      "Charles Dickens",
      "Leo Tolstoy",
    ],
    correctAnswer: ["William Shakespeare"],
  },
  {
    id: 5,
    question: "Who wrote 'Hamlet'?",
    options: [
      "William Shakespeare",
      "Jane Austen",
      "Charles Dickens",
      "Leo Tolstoy",
    ],
    correctAnswer: ["William Shakespeare"],
  },
  {
    id: 6,
    question: "Which of the following elements are noble gases?",
    options: ["Helium", "Oxygen", "Neon", "Nitrogen"],
    correctAnswer: ["Helium", "Neon"],
  },
  {
    id: 7,
    question: "What is the chemical symbol for gold?",
    options: ["Au", "Ag", "Hg", "Fe"],
    correctAnswer: ["Au"],
  },
  {
    id: 8,
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Canberra", "Melbourne", "Brisbane", "London"],
    correctAnswer: ["Canberra"],
  },
  {
    id: 9,
    question: "In which year did Christopher Columbus reach the Americas?",
    options: ["1492", "1607", "1776", "1453"],
    correctAnswer: ["1492"],
  },
  {
    id: 10,
    question:
      "Which of the following planets are considered terrestrial planets?",
    options: ["Mercury", "Jupiter", "Earth", "Saturn"],
    correctAnswer: ["Mercury", "Earth"],
  },
  {
    id: 11,
    question: "Who is known as the father of modern physics?",
    options: [
      "Albert Einstein",
      "Isaac Newton",
      "Galileo Galilei",
      "Nikola Tesla",
    ],
    correctAnswer: ["Albert Einstein"],
  },
];

const frontendQuizData = quizData.map(({ id, question, options, correctAnswer }) => ({
  id,
  question,
  options,
  answersQuantity: correctAnswer.length < 2 ?  "single": "multiple",
}));



const KeyGenerator = (function() {
  let prefix = "GIAIC-Q1";
  let year = new Date().getFullYear();
  let currentIndex = 1;
  let currentKey = null;
  let timer = null;

  function generateRandomKey() {
    const formattedIndex = String(currentIndex).padStart(3, '0');
    return `${prefix}-${formattedIndex}-${year}`;
  }

  function updateKey() {
    currentKey = generateRandomKey();
    console.log(`New Key Generated: ${currentKey}`);
    currentIndex++;
    if (currentIndex > 50) {
      currentIndex = 1;
    }
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
    getCurrentKey: getCurrentKey
  };
})();

KeyGenerator.start();

app.post('/testkey', (req, res) => {
  const userKey = req.body.key;
  const currentKey = KeyGenerator.getCurrentKey();
  if (userKey === currentKey) {
    res.json({ success: true, message: "Key is valid" });
  } else {
    res.json({ success: false, message: "Key is invalid" });
  }
});
let score = 0;
app.get("/quiz", authenticate, (req, res) => {
  score = 0;
  const shuffledQuiz = shuffleArray([...frontendQuizData]);
  const shuffled = shuffledQuiz.slice(0, 5);
  const timestamp = new Date().toISOString();
  res.json({ questions: shuffled, timestamp });
});
app.post("/quiz", async (req, res) => {
  try {
    const { userResponses } = req.body;
    const { user } = req.body

    userResponses.forEach(({ questionId, userAnswer }) => {
      const currentQuestion = quizData.find(q => q.id === questionId);
      if (!currentQuestion) {
        throw new Error("Invalid question ID");
      }

      const correctAnswers = currentQuestion.correctAnswer;

      if (
        userAnswer &&
        userAnswer.length === correctAnswers.length &&
        userAnswer.every(ans => correctAnswers.includes(ans))
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
