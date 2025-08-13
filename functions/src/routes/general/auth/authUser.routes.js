const { Router } = require("express");
const  { getAuth, signInWithEmailAndPassword }  = require( "firebase/auth");

const router = Router();
const admin = require("firebase-admin");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const auth = getAuth();
   const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Signed in
    const user = userCredential.user;
    console.log("User signed in:", user);
   //})
  
    // const user = await admin.auth().getUserByEmail(email);
    // if (!user) {
    //   return res.status(404).json({ error: "UserNotFound" });
    // }

    // const isValidPassword = await admin.auth().verifyPasswordHash(user.passwordHash, password);
    // if (!isValidPassword) {
    //   return res.status(401).json({ error: "InvalidCredentials" });
    // }

    // const token = await admin.auth().createCustomToken(user.uid);
     return res.status(200).json({ user });
  } catch (error) {
    console.error("Error logging in:", error);
     const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Sign-in error:", errorCode, errorMessage);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

module.exports = router;