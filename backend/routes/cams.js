const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

router.post("/redirect", async (req, res) => {
  try {
    const {
      fiuID,
      userId,
      aaCustomerMobile,
      aaCustomerHandleId,
      useCaseid,
    } = req.body;

    /* ---------------- Authentication ---------------- */

    const auth = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/Authentication`,
      {
        fiuID: process.env.CAMS_FIU_ID,
        redirection_key: process.env.CAMS_REDIRECTION_KEY,
        userId: process.env.CAMS_USER_ID,
      }
    );

    const token = auth.data.token;
    const sessionId = auth.data.sessionId;

    /* ---------------- RedirectAA ---------------- */

    const redirect = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/RedirectAA`,
      {
        clienttrnxid: crypto.randomUUID(),
        fiuID,
        userId,
        aaCustomerMobile,
        aaCustomerHandleId,
        sessionId,
        useCaseid,
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
      statusCode: 200,
      sessionId,
      consentHandle: redirect.data.consentHandle,
      redirectionurl: redirect.data.redirectionurl,
      txnId: redirect.data.txnid,
    });
  } catch (err) {
    console.error("CAMS ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message:
        err.response?.data?.message || "CAMS Redirect Failed",
    });
  }
});

module.exports = router;