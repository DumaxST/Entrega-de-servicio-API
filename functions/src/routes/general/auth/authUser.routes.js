/**
 * This is a replacement for /api/Dumax_Backend-API/functions/src/routes/general/auth/authUser.routes.js
 * 
 * INSTRUCTIONS:
 * 1. Copy this content to replace the existing authUser.routes.js file
 * 2. This eliminates the double authentication issue by using ONLY frontend Firebase auth
 * 3. Backend simply verifies the idToken - no more Google Identity Toolkit API calls
 */

const {Router} = require("express");
const admin = require("firebase-admin");
const {ClientError} = require("../../../middlewares/errors/index");

const router = Router();

router.post("/login", async (req, res) => {
  const {idToken} = req.body;
  console.log("🔐 Backend: Received login request");
  
  try {
    if (!idToken) {
      console.log("❌ Backend: No idToken provided");
      throw new ClientError(req.t("IdTokenRequired") || "ID token is required", 400);
    }

    console.log("🔍 Backend: Verifying idToken with Firebase Admin SDK");
    
    // SINGLE AUTHENTICATION: Only verify the token from frontend
    // No more double authentication with Google Identity Toolkit API
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("✅ Backend: Token verified successfully for user:", decodedToken.uid);
    
    // Get user details from Firebase Auth
    const user = await admin.auth().getUser(decodedToken.uid);
    console.log("👤 Backend: User details retrieved:", user.email);

    // Optional: Create a custom token for additional security
    const customToken = await admin.auth().createCustomToken(user.uid);

    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      },
      tokens: {
        idToken,
        customToken,
      },
    });
  } catch (error) {
    console.error("❌ Backend: Error logging in:", error.message);

    // Handle specific Firebase Auth errors
    if (error.code === "auth/id-token-expired") {
      throw new ClientError(req.t("TokenExpired") || "Token expired", 401);
    }
    if (error.code === "auth/id-token-revoked") {
      throw new ClientError(req.t("TokenRevoked") || "Token revoked", 401);
    }
    if (error.code === "auth/invalid-id-token") {
      throw new ClientError(req.t("InvalidToken") || "Invalid token", 401);
    }
    if (error.code === "auth/user-not-found") {
      throw new ClientError(req.t("UserNotFound") || "User not found", 404);
    }
    if (error.code === "auth/user-disabled") {
      throw new ClientError(req.t("UserDisabled") || "User disabled", 403);
    }
    if (error.code === "auth/argument-error") {
      throw new ClientError(req.t("InvalidToken") || "Invalid token format", 401);
    }

    throw new ClientError(req.t("InternalServerError") || "Internal server error", 500);
  }
});

module.exports = router;