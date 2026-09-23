const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from backend folder
dotenv.config({
  path: path.join(__dirname, ".env"),
});

const employeeRoutes = require("./routes/employee");
const authRoutes = require("./routes/auth");
const camsRoutes = require("./routes/cams");
const consentRoutes = require("./routes/consent");
const fetchRoutes = require("./routes/fetch");

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================================
   MIDDLEWARE
====================================== */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* ======================================
   HOME
====================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Labdhi Banking Backend Running",
    port: PORT,
  });
});

/* ======================================
   HEALTH CHECK
====================================== */

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working Successfully",
  });
});

/* ======================================
   API ROUTES
====================================== */

app.use("/api/employee", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cams", camsRoutes);
app.use("/api/cams", consentRoutes);
app.use("/api/cams", fetchRoutes);

/* ======================================
   404 HANDLER
====================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
    path: req.originalUrl,
  });
});

/* ======================================
   START SERVER
====================================== */

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});