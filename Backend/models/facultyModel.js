const { sql } = require('../utils/db');

async function createFacultyTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS faculty (
      id SERIAL PRIMARY KEY,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `;
}

async function findFacultyByEmail(email) {
  return sql`SELECT * FROM faculty WHERE email = ${email}`;
}
async function findFacultyById(id) {
  return sql`SELECT * FROM faculty WHERE id = ${id}`;
}

async function insertFaculty(fullName, email, hashedPassword) {
  return sql`
    INSERT INTO faculty (fullName, email, password) VALUES (${fullName}, ${email}, ${hashedPassword})
  `;
}

module.exports = {
  createFacultyTable,
  findFacultyByEmail,
  findFacultyById,
  insertFaculty,
};
