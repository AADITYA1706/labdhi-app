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

    /* =========================
       STEP 1 : Authentication
    ========================== */

    const authResponse = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/Authentication`,
      {
        fiuID: process.env.CAMS_FIU_ID,
        redirection_key: process.env.CAMS_REDIRECTION_KEY,
        userId: process.env.CAMS_USER_ID,
      }
    );

    const token = authResponse.data.token;
    const sessionId = authResponse.data.sessionId;

    /* =========================
       STEP 2 : RedirectAA
    ========================== */

    const redirectResponse = await axios.post(
      `${process.env.CAMS_BASE_URL}/api/FIU/RedirectAA`,
      {
        clienttrnxid: crypto.randomUUID(),
        fiuID,
        userId,
        aaCustomerHandleId,
        aaCustomerMobile,
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
      consentHandle: redirectResponse.data.consentHandle,
      redirectionurl: redirectResponse.data.redirectionurl,
      txnId: redirectResponse.data.txnid,
    });
  } catch (err) {
    console.error(
      err.response?.data || err.message
    );

    return res.status(500).json({
      success: false,
      message:
        err.response?.data?.message ||
        "CAMS Redirect Failed",
    });
  }
});

module.exports = router;