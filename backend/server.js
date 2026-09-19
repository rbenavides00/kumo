const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.use("/auth", require("./src/routes/auth"));
app.use("/files", require("./src/routes/files"));
app.use("/folders", require("./src/routes/folders"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
