const keyGenerator = require("../utils/keyGenerator");
const { generateToken } = require("../middleware/jwtUtils");

async function getCurrentKey(req, res) {
  try {
    const currentKey = keyGenerator.getCurrentKey();
    if (!currentKey) {
      return res.status(500).json({ error: "Key generation not started" });
    }
    res.json({ currentKey });
  } catch (error) {
    console.error("Error fetching current key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
} 

async function validateKey(req, res) {
  const { key: userKey, userId } = req.body;

  try {
    const token = generateToken({ userId });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    const currentKey = keyGenerator.getCurrentKey();
    if (userKey === currentKey) {
      res.json({ success: true, message: "Key is valid" });
    } else {
      res.json({ success: false, message: "Key is invalid" });
    }
  } catch (error) {
    console.error("Error validating key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getCurrentKey,
  validateKey,
};
