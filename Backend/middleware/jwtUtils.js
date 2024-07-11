const jwt = require('jsonwebtoken');
require('dotenv').config();
function generateToken(user) {
  return jwt.sign(user, process.env.SECRATE_KEY, { expiresIn: '1h' });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRATE_KEY, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = { generateToken, verifyToken };
