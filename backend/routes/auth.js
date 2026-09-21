const express = require("express");
const axios = require("axios");
const path = require("path");
const { randomUUID } = require("crypto");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env")
});

const router = express.Router();

function buildCamsFailureResponse(username, message) {
  const trimmedUsername = String(username || "").trim();

  return {
    success: false,
    message,
    data: {
      userId: trimmedUsername,
      redirectUrl: "",
      sessionId: "",
      aaCustomerHandleId: "",
      aaCustomerMobile: "",
      user: {
        fullname: "Kunal Labdhi",
        email: trimmedUsername,
        role: "customer",
      },
    },
  };
}

/* ===========================
   CAMS AXIOS INSTANCE
=========================== */

const CAMS = axios.create({
  baseURL: process.env.CAMS_BASE_URL || "https://uatapp.finduit.in",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

CAMS.interceptors.request.use((config) => {
  const token = process.env.CAMS_JWT_TOKEN?.trim();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===========================
   LOGIN → AUTH → REDIRECTAA
=========================== */

router.post("/login", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username & Password required",
      });
    }

    // Demo Credentials
    if (
      username.trim().toLowerCase() !== "kunalr@labdhi.in" ||
      password !== "Admin@12"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password",
      });
    }

    /* ---------- STEP 1 : Authentication ---------- */

    const authPayload = {
      fiuID: process.env.CAMS_FIU_ID,
      redirection_key: process.env.CAMS_REDIRECTION_KEY,
      userId: username.trim(),
    };

    const authRes = await CAMS.post(
      "/api/FIU/Authentication",
      authPayload
    );

    console.log("\n========== AUTH RESPONSE ==========");
    console.log(JSON.stringify(authRes.data, null, 2));
    console.log("==================================\n");

    const authData = authRes.data || {};

    const sessionId =
      authData.sessionId ||
      authData.SessionId ||
      authData.sessionID;

    if (!sessionId) {
      return res.status(500).json({
        success: false,
        message: "Session ID not received from CAMS",
      });
    }

    /* ---------- STEP 2 : RedirectAA ---------- */

    const redirectPayload = {
      clienttrnxid: randomUUID(),
      fiuID: process.env.CAMS_FIU_ID,
      userId: username.trim(),
      aaCustomerHandleId:
        authData.aaCustomerHandleId || "9940353097@CAMSAA",
      aaCustomerMobile:
        authData.aaCustomerMobile || "9940353097",
      sessionId,
      useCaseid: String(process.env.CAMS_USE_CASE_ID),
      fipid: "",
    };

    const redirectRes = await CAMS.post(
      "/api/FIU/RedirectAA",
      redirectPayload
    );

    console.log("\n======= REDIRECT RESPONSE =======");
    console.log(JSON.stringify(redirectRes.data, null, 2));
    console.log("================================\n");

    const rd = redirectRes.data || {};

    const redirectUrl =
      rd.redirectUrl ||
      rd.redirectURL ||
      rd.redirectURI ||
      rd.redirectUri ||
      rd.url ||
      rd.webviewUrl ||
      rd.redirect_link ||
      "";

    return res.status(200).json({
      success: true,
      data: {
        userId: username.trim(),
        sessionId,
        redirectUrl,
        aaCustomerHandleId:
          authData.aaCustomerHandleId || "9940353097@CAMSAA",
        aaCustomerMobile:
          authData.aaCustomerMobile || "9940353097",
        user: {
          fullname: "Kunal Labdhi",
          email: username.trim(),
          role: "customer",
        },
        message: "Login successful",
        token: "demo-token-123",
      },
    });
  } catch (err) {
    const invalidToken =
      err.response?.status === 401 ||
      /invalid token/i.test(err.response?.data?.message || "") ||
      /invalid token/i.test(err.response?.data?.error || "") ||
      /invalid token/i.test(String(err.message || ""));

    console.log("\n========== CAMS LOGIN ERROR ==========");
    console.log("STATUS :", err.response?.status);
    console.log("DATA   :", JSON.stringify(err.response?.data, null, 2));
    console.log("=====================================\n");

    if (invalidToken) {
      console.warn("CAMS JWT rejected. No valid redirect is available.");
      return res.status(401).json(
        buildCamsFailureResponse(
          username,
          "CAMS token invalid. Please fix the CAMS JWT configuration before redirecting."
        )
      );
    }

    return res.status(err.response?.status || 500).json({
      success: false,
      message:
        err.response?.data?.message ||
        err.response?.data?.error ||
        "CAMS Authentication Failed",
    });
  }
});

/* ===========================
   VERIFY CONSENT
=========================== */

router.post("/verify-consent", async (req, res) => {
  try {
    const { userId, sessionId, consentHandle } = req.body;

    const response = await CAMS.post(
      "/api/consent/GetConsentStatus",
      {
        fiuID: process.env.CAMS_FIU_ID,
        consentHandle,
        sessionId,
        txnId: randomUUID(),
        userId,
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.log("CONSENT ERROR:", err.response?.data);

    return res.status(500).json({
      success: false,
      message: "Consent Status Failed",
    });
  }
});

/* ===========================
   DASHBOARD DATA
=========================== */

router.post("/dashboard-data", async (req, res) => {
  try {
    const { sessionId, userId, consentId } = req.body;

    const txnId = randomUUID();

    const statusRes = await CAMS.post(
      "/api/consent/GetConsentStatus",
      {
        fiuID: process.env.CAMS_FIU_ID,
        consentHandle: consentId,
        sessionId,
        txnId,
        userId,
      }
    );

    const consentRes = await CAMS.post(
      "/api/fidata/GetConsentData",
      {
        consentId,
        fiuID: process.env.CAMS_FIU_ID,
      }
    );

    const periodicRes = await CAMS.post(
      "/api/FIData/v2/FetchPeriodicData",
      {
        sessionId,
        consentId,
        txnId,
        fiuID: process.env.CAMS_FIU_ID,
      }
    );

    return res.json({
      success: true,
      data: {
        consentStatus: statusRes.data,
        consentData: consentRes.data,
        periodicData: periodicRes.data,
      },
    });
  } catch (err) {
    console.log("DASHBOARD ERROR:", err.response?.data);

    return res.status(500).json({
      success: false,
      message: "Dashboard Fetch Failed",
    });
  }
});

module.exports = router;