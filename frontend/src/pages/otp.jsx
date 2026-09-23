import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Otp() {
  const navigate = useNavigate();

  const camsData = JSON.parse(localStorage.getItem("camsData") || "{}");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-consent",
        {
          sessionId: camsData.sessionId,
          consentHandle: camsData.consentHandle,
          otp: otp,
          token: camsData.token,
        }
      );

      if (res.data.success) {
        // Employee details
        localStorage.setItem("employeeLoggedIn", "true");
        localStorage.setItem("fullname", camsData.fullname || "Employee");
        localStorage.setItem("department", camsData.department || "Banking");

        // CAMS Details
        localStorage.setItem("camsConsent", "true");
        localStorage.setItem("consentId", res.data.consentId || camsData.consentHandle);
        localStorage.setItem("sessionId", camsData.sessionId);
        localStorage.setItem("camsToken", camsData.token);

        navigate("/dashboard");
      } else {
        setError(res.data.message || "OTP Verification Failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/resend-otp",
        {
          sessionId: camsData.sessionId,
          consentHandle: camsData.consentHandle,
          token: camsData.token,
        }
      );

      alert("OTP Resent Successfully");
    } catch {
      alert("Unable to resend OTP");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={verifyOtp}>
        <div style={styles.logo}>L</div>

        <h2 style={styles.title}>Verify OTP</h2>

        <p style={styles.subtitle}>
          Enter the 6-digit OTP sent to your registered mobile number
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
          placeholder="000000"
          style={styles.input}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={resendOtp}
          style={styles.resend}
        >
          Resend OTP
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eef4ff",
  },

  card: {
    width: 380,
    background: "#fff",
    borderRadius: 18,
    padding: 30,
    boxShadow: "0 10px 25px rgba(0,0,0,.1)",
    textAlign: "center",
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
    fontSize: 28,
    fontWeight: 700,
  },

  title: {
    color: "#1e40af",
    marginBottom: 10,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 25,
  },

  input: {
    width: "100%",
    padding: 14,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    marginBottom: 18,
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 16,
  },

  resend: {
    marginTop: 16,
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 600,
  },

  error: {
    color: "#dc2626",
    marginBottom: 10,
    fontSize: 13,
  },
};