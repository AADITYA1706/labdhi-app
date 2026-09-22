import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Cams() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const continueToCAMS = async (e) => {
    e.preventDefault();
    setError("");

    if (mobile.length !== 10) {
      setError("Enter your registered mobile number");
      return;
    }

    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");

      const res = await axios.post(
        "http://localhost:5000/api/cams/redirect",
        {
          fiuID: "Labdhi_UAT",
          userId,
          aaCustomerMobile: mobile,
          aaCustomerHandleId: `${mobile}@CAMSAA`,
          useCaseid: "1656",
        }
      );

      if (!res.data) {
        throw new Error("Unable to connect CAMS");
      }

      const redirectUrl = res.data.redirectionurl;

      if (!redirectUrl) {
        throw new Error("CAMS did not return a consent URL");
      }

      localStorage.setItem("mobile", mobile);
      localStorage.setItem("sessionId", res.data.sessionId);
      localStorage.setItem("consentHandle", res.data.consentHandle);
      localStorage.setItem("redirectUrl", redirectUrl);
      localStorage.setItem("camsData", JSON.stringify({
        userId,
        sessionId: res.data.sessionId,
        consentHandle: res.data.consentHandle,
        redirectionurl: redirectUrl,
        aaCustomerMobile: mobile,
        aaCustomerHandleId: `${mobile}@CAMSAA`,
        txnId: res.data.txnId,
      }));

      window.location.assign(redirectUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to connect CAMS"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo">L</div>

        <h1 className="title">CAMS Finserv</h1>

        <p className="subtitle">
          Enter your registered mobile number to continue
        </p>

        <form className="login-form" onSubmit={continueToCAMS}>

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

          <button className="btn" disabled={loading}>
            {loading ? "Connecting..." : "Continue to CAMS"}
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
          Back
        </button>

      </div>
    </div>
  );
}