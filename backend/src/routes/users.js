const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const authMiddleware = require("../middleware/auth");
const {
  avatarUpload,
  processAvatar,
} = require("../middleware/storage/avatarStorage");

const router = express.Router();

function toPublicUser(user) {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

// Get current user's profile
router.get("/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

  res.json(toPublicUser(user));
});

// Update name
router.patch("/me", authMiddleware, (req, res) => {
  const { firstName, lastName } = req.body;

  db.prepare("UPDATE users SET first_name = ?, last_name = ? WHERE id = ?").run(
    firstName?.trim() ?? "",
    lastName?.trim() ?? "",
    req.user.id,
  );

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

  res.json(toPublicUser(user));
});

// Serve the current user's avatar image
router.get("/me/avatar", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

  if (!user.avatar_path || !fs.existsSync(user.avatar_path)) {
    return res.status(404).json({ error: "No avatar set" });
  }

  res.sendFile(path.resolve(user.avatar_path));
});

// Update avatar
router.patch(
  "/me/avatar",
  authMiddleware,
  avatarUpload.single("avatar"),
  processAvatar,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.user.id);

    // Delete the old avatar file, if any
    if (user.avatar_path) {
      fs.unlink(user.avatar_path, () => {});
    }

    db.prepare("UPDATE users SET avatar_path = ? WHERE id = ?").run(
      req.file.path,
      req.user.id,
    );

    res.json(toPublicUser({ ...user, avatar_path: req.file.path }));
  },
);

// Update password
router.patch("/me/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new password are required" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters" });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    req.user.id,
  );

  res.json({ message: "Password updated" });
});

// Public profile info of any user
router.get("/:id", authMiddleware, (req, res) => {
  const user = db
    .prepare(
      `
        SELECT id, username, first_name, last_name, avatar_path
        FROM users WHERE id = ?
      `,
    )
    .get(req.params.id);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    hasAvatar: Boolean(user.avatar_path),
  });
});

// Avatar of any user
router.get("/:id/avatar", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT avatar_path FROM users WHERE id = ?")
    .get(req.params.id);

  if (!user?.avatar_path || !fs.existsSync(user.avatar_path)) {
    return res.status(404).json({ error: "No avatar set" });
  }

  res.sendFile(path.resolve(user.avatar_path));
});

module.exports = router;
