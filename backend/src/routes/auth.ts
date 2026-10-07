import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type {
  LoginBody,
  LoginResponse,
  MessageResponse,
  RegisterBody,
} from "@kumo/shared";

import db from "../db/database.js";
import type { UserRow } from "../db/rows.js";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET is not defined");
  })();

const router = Router();

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

// Register
router.post("/register", async (req, res) => {
  const body = req.body as Partial<RegisterBody>;

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return res.status(400).json({
      error: "Username or password are missing",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
      username,
      passwordHash,
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    throw error;
  }

  const response: MessageResponse = { message: "User created" };

  return res.status(201).json(response);
});

// Login
router.post("/login", async (req, res) => {
  const body = req.body as Partial<LoginBody>;

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return res.status(400).json({
      error: "Username or password are missing",
    });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as UserRow | undefined;

  const isPasswordValid =
    user !== undefined && (await bcrypt.compare(password, user.password_hash));

  if (!user || !isPasswordValid) {
    return res.status(401).json({
      error: "Incorrect username/password",
    });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });

  const response: LoginResponse = { token };

  return res.json(response);
});

export default router;
