const express = require("express");
const axios = require("axios");

const router = express.Router();

/* ==============================
   GET CONSENT STATUS
============================== */

router.post("/status", async (req, res) => {
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

    return res.json({
      success: true,
      consentStatus: response.data.consentStatus,
      consentId: response.data.consentId,
      data: response.data,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Consent Status",
    });
  }
});

module.exports = router;