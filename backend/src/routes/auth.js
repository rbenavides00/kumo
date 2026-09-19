const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username or password are missing" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const existingUser = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);

  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
    username,
    passwordHash,
  );

  return res.status(201).json({ message: "User created" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user) {
    return res.status(401).json({ error: "Incorrect username/password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Incorrect username/password" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return res.json({ token });
});

module.exports = router;
