const express = require("express");
const axios = require("axios");

const router = express.Router();

/* ===============================
   FETCH FI DATA
================================ */

router.post("/fetch", async (req, res) => {
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

    return res.json({
      success: true,
      portfolio: response.data,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch FI Data",
    });
  }
});

module.exports = router;