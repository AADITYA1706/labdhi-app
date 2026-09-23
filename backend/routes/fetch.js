const express = require("express");
const axios = require("axios");

const router = express.Router();

/* =====================================================
   FETCH FI DATA
   POST /api/cams/fetch
===================================================== */

router.post("/fetch", async (req, res) => {
  try {
    const { sessionId, consentId, token } = req.body;

    if (!sessionId || !consentId || !token) {
      return res.status(400).json({
        success: false,
        message: "sessionId, consentId and token are required",
      });
    }

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

    return res.status(200).json({
      success: true,
      message: "FI Data fetched successfully",
      portfolio: response.data,
    });

  } catch (err) {
    console.error("========== FETCH FI DATA ERROR ==========");
    console.error(err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Unable to fetch FI Data",
    });
  }
});

module.exports = router;