const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const employeeRoutes = require("./routes/employee");
const authRoutes = require("./routes/auth");
const camsRoutes = require("./routes/cams");
const consentRoutes = require("./routes/consent");
const fetchRoutes = require("./routes/fetch");

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================================
   CORS (ALL LOCALHOST + LAN)
====================================== */

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / Browser direct request
      if (!origin) return callback(null, true);

      // Allow localhost any port
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      // Allow 127.0.0.1 any port
      if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        return callback(null, true);
      }

      // Allow LAN IP any port
      if (/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

/* ======================================
   HOME
====================================== */

app.get("/", (req, res) => {
  res.send("🚀 Labdhi Banking Backend Running");
});

/* ======================================
   HEALTH
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
   404
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});