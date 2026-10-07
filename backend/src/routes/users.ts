import { Router } from "express";
import bcrypt from "bcrypt";
import path from "node:path";
import fs from "node:fs";
import type { UpdatePasswordBody, UpdateProfileBody } from "@kumo/shared";

import db from "../db/database.js";
import type { PublicUserRow, UserRow } from "../db/rows.js";
import authMiddleware from "../middleware/auth.js";
import {
  avatarUpload,
  processAvatar,
} from "../middleware/storage/avatarStorage.js";
import { toCurrentUser, toPublicUser } from "../db/mappers/user.js";

const router = Router();

function findUserById(id: number): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
}

// Get current user's profile
router.get("/me", authMiddleware, (req, res) => {
  const user = findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(toCurrentUser(user));
});

// Update name
router.patch("/me", authMiddleware, (req, res) => {
  const { firstName, lastName } = req.body as Partial<UpdateProfileBody>;

  db.prepare("UPDATE users SET first_name = ?, last_name = ? WHERE id = ?").run(
    firstName?.trim() ?? "",
    lastName?.trim() ?? "",
    req.user.id,
  );

  const user = findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(toCurrentUser(user));
});

// Serve current user's avatar
router.get("/me/avatar", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT avatar_path FROM users WHERE id = ?")
    .get(req.user.id) as Pick<UserRow, "avatar_path"> | undefined;

  if (!user?.avatar_path || !fs.existsSync(user.avatar_path)) {
    return res.status(404).json({ error: "No avatar set" });
  }

  return res.sendFile(path.resolve(user.avatar_path));
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

    const user = findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old avatar
    if (user.avatar_path) {
      fs.unlink(user.avatar_path, () => {});
    }

    db.prepare("UPDATE users SET avatar_path = ? WHERE id = ?").run(
      req.file.path,
      req.user.id,
    );

    return res.json(toCurrentUser({ ...user, avatar_path: req.file.path }));
  },
);

// Update password
router.patch("/me/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } =
    req.body as Partial<UpdatePasswordBody>;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "Current and new password are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      error: "New password must be at least 8 characters",
    });
  }

  const user = findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!valid) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    req.user.id,
  );

  return res.json({ message: "Password updated" });
});

// List other users
router.get("/", authMiddleware, (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  const params = search ? [req.user.id, `%${search}%`] : [req.user.id];

  const users = db
    .prepare(
      `
      SELECT id, username, first_name, last_name, avatar_path
      FROM users
      WHERE id != ? ${search ? "AND username LIKE ?" : ""}
      ORDER BY username
      LIMIT 20
    `,
    )
    .all(...params) as PublicUserRow[];

  return res.json(users.map(toPublicUser));
});

// Public profile info of any user
router.get("/:id", authMiddleware, (req, res) => {
  const user = db
    .prepare(
      `
      SELECT id, username, first_name, last_name, avatar_path
      FROM users
      WHERE id = ?
    `,
    )
    .get(req.params.id) as PublicUserRow | undefined;

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(toPublicUser(user));
});

// Avatar of any user
router.get("/:id/avatar", authMiddleware, (req, res) => {
  const user = db
    .prepare("SELECT avatar_path FROM users WHERE id = ?")
    .get(req.params.id) as Pick<UserRow, "avatar_path"> | undefined;

  if (!user?.avatar_path || !fs.existsSync(user.avatar_path)) {
    return res.status(404).json({ error: "No avatar set" });
  }

  return res.sendFile(path.resolve(user.avatar_path));
});

export default router;
