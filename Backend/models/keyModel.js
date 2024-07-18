const { sql } = require('../utils/db');

async function createKeysTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS keys (
      id SERIAL PRIMARY KEY,
      key TEXT,
      generated_at TIMESTAMP
    )
  `;
}

async function insertKey(key, generatedAt) {
  return sql`
    INSERT INTO keys (key, generated_at) VALUES (${key}, ${generatedAt})
  `;
}

module.exports = {
  createKeysTable,
  insertKey,
};
