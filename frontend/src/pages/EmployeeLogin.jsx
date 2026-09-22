import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

export default function EmployeeLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/employee/login`, {
        username: username.trim(),
        password,
      });

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      const emp = res.data.data;

      localStorage.setItem("employeeLoggedIn", "true");
      localStorage.setItem("employeeId", emp.employeeId);
      localStorage.setItem("fullname", emp.fullname);
      localStorage.setItem("department", emp.department);
      localStorage.setItem("employeeEmail", emp.userId);

      navigate("/cams-login");
    } catch (err) {
      setError(err.response?.data?.message || "Employee Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">L</div>

        <h1 className="title">Employee Login</h1>

        <p className="subtitle">Sign in using your Labdhi employee account</p>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            className="input"
            placeholder="Official Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <p className="footer-text">Don't have an employee account?</p>

          <Link to="/signup" className="logout-btn">
            Create Employee Account
          </Link>
        </div>
      </div>
    </div>
  );
}
