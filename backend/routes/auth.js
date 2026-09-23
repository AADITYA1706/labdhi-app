const express = require("express");
const axios = require("axios");
const { randomUUID } = require("crypto");

const router = express.Router();

/* =====================================================
   CAMS FIU LOGIN
   POST /api/auth/login
===================================================== */

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username required",
      });
    }

    const authRes = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/Authentication`,
      {
        fiuID: process.env.CAMS_FIU_ID,
        redirection_key: process.env.CAMS_REDIRECTION_KEY,
        userId: process.env.CAMS_USER_ID,
      }
    );

    const token = authRes.data.token;
    const sessionId = authRes.data.sessionId;

    const redirectRes = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/RedirectAA`,
      {
        clienttrnxid: randomUUID(),
        fiuID: process.env.CAMS_FIU_ID,
        userId: username,
        aaCustomerHandleId: "9940353097@CAMSAA",
        aaCustomerMobile: "9940353097",
        sessionId,
        useCaseid: process.env.CAMS_USE_CASE_ID,
        fipid: "",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      success: true,
      data: {
        userId: username,
        token,
        sessionId,
        consentHandle: redirectRes.data.consentHandle,
        redirectUrl: redirectRes.data.redirectionurl,
        txnId: redirectRes.data.txnid,
      },
    });
  } catch (err) {
    console.error("CAMS LOGIN:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "CAMS Login Failed",
    });
  }
});

/* =====================================================
   VERIFY CONSENT
   POST /api/auth/verify-consent
===================================================== */

router.post("/verify-consent", async (req, res) => {
  try {
    const { sessionId, consentHandle, token } = req.body;

    const response = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/consent/GetConsentStatus`,
      {
        sessionId,
        consentHandle,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.consentStatus === "ACTIVE") {
      return res.json({
        success: true,
        consentId: response.data.consentId,
        sessionId,
      });
    }

    return res.json({
      success: false,
      message: "Consent not approved yet",
    });
  } catch (err) {
    console.error("VERIFY CONSENT:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Consent verification failed",
    });
  }
});

/* =====================================================
   RESEND OTP
   POST /api/auth/resend-otp
===================================================== */

router.post("/resend-otp", async (req, res) => {
  try {
    const { sessionId, consentHandle, token } = req.body;

    await axios.post(
      `${process.env.CAMS_BASE_URL}/api/consent/ResendOTP`,
      {
        sessionId,
        consentHandle,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.error("RESEND OTP:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to resend OTP",
    });
  }
});

/* =====================================================
   DASHBOARD DATA
   POST /api/auth/dashboard-data
===================================================== */

router.post("/dashboard-data", async (req, res) => {
  try {
    const { sessionId, consentId, token } = req.body;

    const response = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/fidata/GetConsentData`,
      {
        sessionId,
        consentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const portfolio = response.data;

    return res.json({
      success: true,
      data: {
        accounts: portfolio.accounts || [],
        transactions: portfolio.transactions || [],
        dmat: portfolio.dmat || [],
        insurance: portfolio.insurance || [],
      },
    });
  } catch (err) {
    console.error("DASHBOARD:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
});

module.exports = router;