import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", username: "", password: "", mobile: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const registerUser = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/register", form);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("otpUserId", data.user.id);
      localStorage.setItem("otpMobile", data.user.mobile);
      if (data.devOtp) localStorage.setItem("devOtp", data.devOtp);
      navigate("/otp");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={registerUser}>
        <div style={styles.logo}>L</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Your mobile number will receive the verification OTP.</p>
        <input style={styles.input} placeholder="Full name" value={form.fullname} onChange={(e) => update("fullname", e.target.value)} required />
        <input style={styles.input} placeholder="Username" value={form.username} onChange={(e) => update("username", e.target.value.toLowerCase())} required autoComplete="username" />
        <input style={styles.input} type="password" placeholder="Password (6+ characters)" value={form.password} onChange={(e) => update("password", e.target.value)} minLength="6" required autoComplete="new-password" />
        <input style={styles.input} placeholder="10-digit mobile number" value={form.mobile} onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength="10" required />
        <select style={styles.input} value={form.role} onChange={(e) => update("role", e.target.value)}><option value="customer">Customer</option><option value="employee">Employee</option></select>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
        <p style={styles.footer}>Already registered? <Link to="/" style={styles.link}>Sign in</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#EEF4FF", padding: "20px", boxSizing: "border-box" },
  card: { width: "400px", background: "#FFFFFF", padding: "32px", borderRadius: "18px", boxShadow: "0 12px 30px rgba(0,0,0,.12)" },
  logo: { width: 60, height: 60, borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 18px", fontSize: 28, fontWeight: "700" },
  title: { textAlign: "center", color: "#1E40AF", margin: 0 },
  subtitle: { textAlign: "center", color: "#64748B", margin: "8px 0 22px", fontSize: "14px" },
  input: { width: "100%", padding: "12px", marginBottom: "14px", borderRadius: "10px", border: "1px solid #CBD5E1", fontSize: "15px", boxSizing: "border-box" },
  button: { width: "100%", padding: "13px", border: "none", borderRadius: "10px", background: "#2563EB", color: "#FFFFFF", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  footer: { textAlign: "center", marginTop: "18px", color: "#64748B", fontSize: "14px" },
  link: { color: "#2563EB", fontWeight: "600" },
  error: { color: "#B91C1C", fontSize: "13px", margin: "0 0 12px" },
};
