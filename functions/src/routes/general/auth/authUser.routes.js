const { Router } = require("express");
const admin = require("firebase-admin");
const axios = require("axios");
const { ClientError } = require("../../../middlewares/auth");

const router = Router();
require("dotenv").config();
const key = process.env.KEY;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new ClientError(req.t("EmailAndPasswordRequired"), 400);
    }

    const authResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, refreshToken, localId } = authResponse.data;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    const customToken = await admin.auth().createCustomToken(user.uid);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      },
      tokens: {
        idToken,
        customToken
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    
    if (error.response && error.response.data) {
      const firebaseError = error.response.data.error;
      if (firebaseError.message === "EMAIL_NOT_FOUND") {
        throw new ClientError(req.t("UserNotFound"), 404);
      }
      if (firebaseError.message === "INVALID_PASSWORD" || firebaseError.message === "INVALID_LOGIN_CREDENTIALS") {
        throw new ClientError(req.t("InvalidCredentials"), 401);
      }
      if (firebaseError.message === "USER_DISABLED") {
        throw new ClientError(req.t("UserDisabled"), 403);
      }
    }
    
    throw new ClientError(req.t("InternalServerError"), 500);
  }
});

module.exports = router;