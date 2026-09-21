import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Otp() {
  const navigate = useNavigate();
  const camsData = JSON.parse(localStorage.getItem("camsData") || "{}");
  const userId = camsData.userId || localStorage.getItem("otpUserId") || "kunalr@labdhi.in";
  const sessionId = camsData.sessionId || "";
  const consentHandle = camsData.consentHandle || camsData.consentId || "";
  const mobile = camsData.aaCustomerMobile || localStorage.getItem("otpMobile") || "9940353097";
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("Confirm consent for Labdhi UAT access.");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/verify-consent", {
        userId,
        sessionId,
        consentHandle,
        txnId: camsData.txnId || "",
      });

      if (data.success) {
        localStorage.setItem("fullname", "Kunal Labdhi");
        localStorage.setItem("role", "FIU Customer");
        localStorage.setItem("consentId", consentHandle);
        navigate("/dashboard");
        return;
      }

      setError(data.message || "Consent verification failed.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify consent.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("Consent verification re-triggered.");
  };

  if (!sessionId && !userId) {
    navigate("/");
    return null;
  }

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={verify}>
        <div style={styles.logo}>L</div>
        <h1 style={styles.title}>Consent verification</h1>
        <p style={styles.subtitle}>Approve access for ******{String(mobile).slice(-4)}.</p>
        <input
          style={styles.input}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          maxLength="6"
          placeholder="Enter OTP"
          autoFocus
          required
        />
        {message && <p style={styles.message}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} disabled={loading}>{loading ? "Verifying..." : "Verify Consent"}</button>
        <button type="button" style={styles.resend} onClick={resend}>Resend</button>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#EEF4FF" },
  card: { width: "390px", background: "#FFFFFF", padding: "32px", borderRadius: "18px", boxShadow: "0 12px 30px rgba(0,0,0,.12)", textAlign: "center" },
  logo: { width: 60, height: 60, borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 18px", fontSize: 28, fontWeight: "700" },
  title: { color: "#1E3A8A", margin: 0 },
  subtitle: { color: "#64748B", fontSize: 14, margin: "8px 0 22px" },
  input: { width: "100%", boxSizing: "border-box", padding: "14px", border: "1px solid #CBD5E1", borderRadius: "10px", textAlign: "center", fontSize: "20px", letterSpacing: "4px", marginBottom: "14px" },
  button: { width: "100%", padding: "13px", border: "none", borderRadius: "10px", background: "#2563EB", color: "#FFFFFF", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  resend: { border: "none", background: "transparent", color: "#2563EB", marginTop: "16px", cursor: "pointer", fontWeight: "600" },
  message: { color: "#166534", fontSize: "13px" },
  error: { color: "#B91C1C", fontSize: "13px" },
};
