import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Cams() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (mobile.length !== 10) {
      setError("Please enter a valid 10 digit mobile number");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/cams/redirect",
        {
          fiuID: "Labdhi_UAT",
          userId: localStorage.getItem("userId"),
          aaCustomerMobile: mobile,
          aaCustomerHandleId: `${mobile}@CAMSAA`,
          useCaseid: "1656",
        }
      );

      if (res.data.success) {
        localStorage.setItem("mobile", mobile);
        localStorage.setItem("sessionId", res.data.sessionId || "");
        localStorage.setItem(
          "consentHandle",
          res.data.consentHandle || ""
        );

        // Open Real CAMS Page
        window.location.href = res.data.redirectionurl;
      } else {
        setError(res.data.message || "Unable to open CAMS");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "CAMS server connection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">C</div>

        <h1 className="title">CAMS Finserv</h1>

        <p className="subtitle">
          Enter your registered mobile number to continue
        </p>

        <form className="login-form" onSubmit={handleContinue}>
          <input
            type="tel"
            className="input"
            placeholder="Registered Mobile Number"
            maxLength={10}
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, ""))
            }
          />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Opening CAMS..." : "Continue to CAMS"}
          </button>

          {error && (
            <p className="error-message">{error}</p>
          )}
        </form>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Back to Login
        </button>

        <p className="footer-text">
          Secured by CAMS Finserv UAT
        </p>
      </div>
    </div>
  );
}