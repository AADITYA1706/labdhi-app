const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

/* ==========================================
   TEST API
   GET /api/employee/test
========================================== */

router.get("/test", (req, res) => {
  return res.json({
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

    const email = username.trim().toLowerCase();

    // Duplicate check
    const [exist] = await db.execute(
      `SELECT id
       FROM employees
       WHERE employee_id = ? OR LOWER(username) = ?`,
      [employee_id, email]
    );

    if (exist.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or Email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert employee
    await db.execute(
      `INSERT INTO employees
      (employee_id, full_name, department, username, password_hash)
      VALUES (?, ?, ?, ?, ?)`,
      [
        employee_id,
        full_name,
        department,
        email,
        passwordHash,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Employee account created successfully",
    });

  } catch (err) {
    console.log("\n========== SIGNUP ERROR ==========");
    console.log(err);
    console.log("Message :", err.message);
    console.log("SQL     :", err.sqlMessage);
    console.log("Code    :", err.code);
    console.log("=================================\n");

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
      error: err.code || "UNKNOWN_ERROR",
    });
  }
});

/* ==========================================
   EMPLOYEE LOGIN
   POST /api/employee/login
========================================== */

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body?.username || "")
      .trim()
      .toLowerCase();

    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & Password required",
      });
    }

    const [rows] = await db.execute(
      `SELECT
          employee_id,
          full_name,
          department,
          username,
          password_hash
       FROM employees
       WHERE LOWER(username)=?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const employee = rows[0];

    if (!employee.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const match = await bcrypt.compare(password, employee.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    return res.json({
      success: true,
      message: "Login Successful",
      data: {
        userId: employee.username,
        employeeId: employee.employee_id,
        fullname: employee.full_name,
        department: employee.department,
      },
    });

  } catch (err) {
    console.log("\n========== LOGIN ERROR ==========");
    console.log(err);
    console.log("Message :", err.message);
    console.log("SQL     :", err.sqlMessage);
    console.log("Code    :", err.code);
    console.log("================================\n");

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
      error: err.code || "UNKNOWN_ERROR",
    });
  }
});

module.exports = router;