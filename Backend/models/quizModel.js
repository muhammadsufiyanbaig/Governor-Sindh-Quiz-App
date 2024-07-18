const { sql } = require('../utils/db');

async function createQuizTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS typescriptQuiz (
      id SERIAL PRIMARY KEY,
      question TEXT,
      options TEXT[],
      correctAnswer TEXT[]
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS result (
      user_id INT PRIMARY KEY,
      ts_quiz_score INT,
      ts_quiz_timestamp TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;
}

async function getQuizData() {
  return sql`SELECT id, question, options, correctanswer FROM typescriptQuiz`;
}

async function insertResult(userId, score, timestamp) {
  return sql`
    INSERT INTO result (user_id, ts_quiz_score, ts_quiz_timestamp) VALUES (${userId}, ${score}, ${timestamp})
  `;
}

async function findResultByUserId(userId) {
  return sql`SELECT ts_quiz_score FROM result WHERE user_id = ${userId}`;
}

module.exports = {
  createQuizTables,
  getQuizData,
  insertResult,
  findResultByUserId,
};
