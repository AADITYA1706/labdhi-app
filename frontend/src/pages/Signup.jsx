import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_id: "",
    full_name: "",
    department: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/employee/signup",
        form
      );

      if (data.success) {
        setSuccess("Account created successfully!");

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create employee account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">L</div>

        <h1 className="title">Employee Signup</h1>

        <p className="subtitle">
          Create your Labdhi employee account
        </p>

        <form className="login-form" onSubmit={handleSignup}>
          <input
            className="input"
            type="text"
            name="employee_id"
            placeholder="Employee ID"
            value={form.employee_id}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="email"
            name="username"
            placeholder="Official Email"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {success && (
            <p
              style={{
                color: "#16A34A",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {success}
            </p>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}
        </form>

        <p className="footer-text">
          Already have an employee account?
        </p>

        <button
          type="button"
          className="logout-btn"
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}