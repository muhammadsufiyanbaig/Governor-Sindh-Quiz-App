const bcrypt = require("bcrypt");
const { generateToken } = require("../middleware/jwtUtils");
const { findFacultyByEmail, insertFaculty, findFacultyById } = require("../models/facultyModel");

const keyCode = "GIAIC_FACULTY_2024";

async function signupFaculty(req, res) {
  const { fullName, email, password, key } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await findFacultyByEmail(email);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Faculty member already exists" });
    }

    if (keyCode === key) {
      await insertFaculty(fullName, email, hashedPassword);
      const token = generateToken({ email });
      res.json({ message: "Faculty member signed up successfully", token });
    } else {
      res.status(400).json({ error: "Invalid key" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function loginFaculty(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const faculty = await findFacultyByEmail(email);
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
}

async function getFaculty(req, res) {
  const { id } = req.body;
  try {
    const faculty = await findFacultyById(id);
    // console.log(faculty);
    if (faculty.length === 0) {
      return res.status(404).json({ error: "Faculty member not found" });
    }
    res.json(faculty[0]);
  } catch (error) {
    console.error("Error fetching faculty member:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  signupFaculty,
  loginFaculty,
  getFaculty,
};
