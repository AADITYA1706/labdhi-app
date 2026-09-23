const express = require("express");
const axios = require("axios");

const router = express.Router();

/* ======================================================
   CAMS CONSENT STATUS
   POST /api/cams/status
====================================================== */

router.post("/status", async (req, res) => {
  try {
    const { sessionId, consentHandle, token } = req.body;

    if (!sessionId || !consentHandle || !token) {
      return res.status(400).json({
        success: false,
        message: "sessionId, consentHandle and token are required",
      });
    }

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

    return res.status(200).json({
      success: true,
      consentStatus: response.data.consentStatus,
      consentId: response.data.consentId,
      consentHandle,
      sessionId,
      data: response.data,
    });

  } catch (err) {
    console.error("CONSENT STATUS ERROR");
    console.error(err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Unable to fetch Consent Status",
    });
  }
});

module.exports = router;