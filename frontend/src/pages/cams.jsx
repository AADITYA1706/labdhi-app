import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Cams() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    pan: "",
    dob: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      setForm({
        ...form,
        mobile: value.replace(/\D/g, "").slice(0, 10),
      });
      return;
    }

    if (name === "pan") {
      setForm({
        ...form,
        pan: value.toUpperCase(),
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const continueToCAMS = async (e) => {
    e.preventDefault();
    setError("");

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(form.pan)) {
      setError("Enter valid PAN number");
      return;
    }

    if (form.mobile.length !== 10) {
      setError("Enter registered mobile number");
      return;
    }

    if (!form.dob) {
      setError("Select Date of Birth");
      return;
    }

    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");

      const res = await axios.post(
        "/api/cams/redirect",
        {
          fiuID: "Labdhi_UAT",
          userId,
          pan: form.pan,
          dob: form.dob,
          aaCustomerMobile: form.mobile,
          aaCustomerHandleId: `${form.mobile}@CAMSAA`,
          useCaseid: "1656",
        }
      );

      const redirectUrl = res.data.redirectionurl;

      if (!redirectUrl) {
        throw new Error("CAMS did not return a consent URL");
      }

      localStorage.setItem("pan", form.pan);
      localStorage.setItem("dob", form.dob);
      localStorage.setItem("mobile", form.mobile);
      localStorage.setItem("sessionId", res.data.sessionId);
      localStorage.setItem("consentHandle", res.data.consentHandle);

      window.location.href = redirectUrl;
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
          Enter your PAN, DOB & Registered Mobile
        </p>

        <form className="login-form" onSubmit={continueToCAMS}>

          <input
            type="text"
            name="pan"
            className="input"
            placeholder="PAN Number"
            maxLength={10}
            value={form.pan}
            onChange={handleChange}
          />

          <input
            type="date"
            name="dob"
            className="input"
            value={form.dob}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="mobile"
            className="input"
            placeholder="Registered Mobile Number"
            maxLength={10}
            value={form.mobile}
            onChange={handleChange}
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