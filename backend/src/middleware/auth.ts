import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET is not defined");
  })();

function isAuthUser(payload: unknown): payload is Request["user"] {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const { id, username } = payload as Record<string, unknown>;

  return typeof id === "number" && typeof username === "string";
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });

    if (!isAuthUser(payload)) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    req.user = { id: payload.id, username: payload.username };

    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

export default authMiddleware;
