const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const authRoutes = require("./routes/auth");
const camsRoutes = require("./routes/cams");

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: /^http:\/\/localhost:\d+$/,
    credentials: true,
  })
);

app.use(express.json());

/* ---------------- Home ---------------- */

app.get("/", (req, res) => {
  res.send("Labdhi Backend Running 🚀");
});

/* ---------------- Health Check ---------------- */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working",
  });
});

/* ---------------- Routes ---------------- */

// Login
app.use("/api/auth", authRoutes);

// CAMS Redirect
app.use("/api/cams", camsRoutes);

/* ---------------- 404 ---------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

/* ---------------- Start Server ---------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});