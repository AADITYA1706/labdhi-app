import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Fixed Login Credentials
    const validUsername = "kunalr@labdhi.in";
    const validPassword = "Admin@12";

    if (
      username.trim() === validUsername &&
      password === validPassword
    ) {
      // Session Save
      localStorage.setItem("userId", validUsername);
      localStorage.setItem("fullname", "Kunal Labdhi");
      localStorage.setItem("isLoggedIn", "true");

      // Redirect to CAMS Page
      navigate("/cams");
    } else {
      setError("Invalid Username or Password");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo">L</div>

        <h1 className="title">Labdhi Banking</h1>

        <p className="subtitle">
          Secure sign in using your CAMS credentials
        </p>

        <form className="login-form" onSubmit={handleLogin}>

          <input
            type="email"
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="btn"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {error && (
            <p className="error-message">{error}</p>
          )}

        </form>

        <p className="footer-text">
          Protected by CAMS • End-to-End Secure
        </p>

      </div>
    </div>
  );
}