import express from "express";
import helmet from "helmet";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import filesRouter from "./routes/files.js";
import foldersRouter from "./routes/folders.js";
import sharesRouter from "./routes/shares.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "100kb" }));

const api = express.Router();

api.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

api.use("/auth", authRouter);
api.use("/users", usersRouter);
api.use("/files", filesRouter);
api.use("/folders", foldersRouter);
api.use("/shares", sharesRouter);

app.use("/api", api);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
