const express = require("express");
const axios = require("axios");
const { randomUUID } = require("crypto");

const router = express.Router();

/* ======================================
   CAMS FIU LOGIN
   POST /api/auth/login
====================================== */

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required",
      });
    }

    const authentication = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/Authentication`,
      {
        fiuID: process.env.CAMS_FIU_ID,
        redirection_key: process.env.CAMS_REDIRECTION_KEY,
        userId: username,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const auth = authentication.data;

    if (String(auth.statusCode) !== "200" || !auth.sessionId || !auth.token) {
      return res.status(401).json({
        success: false,
        message: auth.message || "CAMS Authentication Failed",
      });
    }

    const redirectResponse = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/RedirectAA`,
      {
        clienttrnxid: randomUUID(),
        fiuID: process.env.CAMS_FIU_ID,
        userId: username,
        aaCustomerHandleId:
          process.env.CAMS_CUSTOMER_HANDLE_ID || "9940353097@CAMSAA",
        aaCustomerMobile:
          process.env.CAMS_CUSTOMER_MOBILE || "9940353097",
        sessionId: auth.sessionId,
        useCaseid: String(process.env.CAMS_USE_CASE_ID),
        fipid: "",
      },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const redirect = redirectResponse.data;

    return res.json({
      success: true,
      data: {
        userId: username,
        sessionId: redirect.sessionId || auth.sessionId,
        redirectUrl: redirect.redirectionurl || redirect.redirectUrl || "",
        aaCustomerHandleId:
          redirect.consentHandle ||
          process.env.CAMS_CUSTOMER_HANDLE_ID ||
          "9940353097@CAMSAA",
        token: auth.token,
      },
    });
  } catch (err) {
    const upstreamMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message;

    console.error("CAMS LOGIN ERROR:", upstreamMessage);

    return res.status(err.response?.status || 502).json({
      success: false,
      message: `CAMS UAT request failed: ${upstreamMessage}`,
    });
  }
});

module.exports = router;