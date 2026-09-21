const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "labdhi_app",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;