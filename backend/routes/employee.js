const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();
const DEMO_EMPLOYEE = {
  username: "kunalr@labdhi.in",
  password: "Admin@12",
  employeeId: "EMP001",
  fullname: "Kunal Labdhi",
  department: "Banking",
};

/* ==========================================
   TEST ROUTE
   GET /api/employee/test
========================================== */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Employee API Working",
  });
});

/* ==========================================
   EMPLOYEE SIGNUP
   POST /api/employee/signup
========================================== */
router.post("/signup", async (req, res) => {
  try {
    const {
      employee_id,
      full_name,
      department,
      username,
      password,
    } = req.body;

    if (
      !employee_id ||
      !full_name ||
      !department ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Duplicate Employee ID / Email check
    const [exist] = await db.query(
      "SELECT id FROM employees WHERE employee_id = ? OR username = ?",
      [employee_id, username]
    );

    if (exist.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or Email already exists",
      });
    }

    // Password Hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert Employee
    await db.query(
      `INSERT INTO employees
      (employee_id, full_name, department, username, password_hash)
      VALUES (?, ?, ?, ?, ?)`,
      [
        employee_id,
        full_name,
        department,
        username,
        passwordHash,
      ]
    );

    res.json({
      success: true,
      message: "Employee account created successfully",
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Unable to create employee account",
    });
  }
});

/* ==========================================
   EMPLOYEE LOGIN
   POST /api/employee/login
========================================== */
router.post("/login", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & Password are required",
      });
    }

    if (
      username.toLowerCase() === DEMO_EMPLOYEE.username &&
      password === DEMO_EMPLOYEE.password
    ) {
      return res.json({
        success: true,
        data: {
          userId: DEMO_EMPLOYEE.username,
          employeeId: DEMO_EMPLOYEE.employeeId,
          fullname: DEMO_EMPLOYEE.fullname,
          department: DEMO_EMPLOYEE.department,
        },
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM employees WHERE LOWER(username) = LOWER(?)",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const employee = rows[0];

    const match = await bcrypt.compare(
      password,
      employee.password_hash
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    res.json({
      success: true,
      data: {
        userId: employee.username,
        employeeId: employee.employee_id,
        fullname: employee.full_name,
        department: employee.department,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Login Failed",
    });
  }
});

module.exports = router;