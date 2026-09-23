const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

router.post("/redirect", async (req, res) => {
  try {
    const {
      fiuID,
      userId,
      pan,
      dob,
      aaCustomerMobile,
      aaCustomerHandleId,
      useCaseid,
    } = req.body;

    // Validation
    if (!pan || !dob || !aaCustomerMobile) {
      return res.status(400).json({
        success: false,
        message: "PAN, DOB and Mobile are required",
      });
    }

    // 1. CAMS Authentication
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

    // 2. CAMS RedirectAA
    const redirectRes = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/RedirectAA`,
      {
        clienttrnxid: crypto.randomUUID(),
        fiuID,
        userId,
        pan,
        dob,
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

    // 3. Response to React
    return res.status(200).json({
      success: true,
      sessionId,
      consentHandle: redirectRes.data.consentHandle,
      redirectionurl: redirectRes.data.redirectionurl,
      txnId: redirectRes.data.txnid,
      pan,
      dob,
      mobile: aaCustomerMobile,
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