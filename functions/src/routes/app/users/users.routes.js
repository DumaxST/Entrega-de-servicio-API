const {Router} = require("express");
const router = Router();

const userSchema = require("./usersSchemas.js");

const {
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} = require("../../../../ccFunctions.js");

const {
  generalDictionary,
  validationErrorsExpress,
} = require("../../../../generalFunctions.js");

const admin = require("firebase-admin");

router.post("/user", userSchema.post, async (req, res) => {
  // if (validationErrorsExpress(req, res)) return;

  const language = req?.query?.lang;
  const {email, password, lastName, firstName, phone, role, profilePicture} =
    req.body;

  try {
    const newUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
    });

    const userData = {
      uid: newUser.uid,
      email: newUser.email,
      firstName: firstName,
      lastName: lastName,
      displayName: newUser.displayName,
      phone: phone || null,
      role: role,
      profilePicture: profilePicture || null,
      createdAt: new Date(),
    };

    const userDoc = await createDocument("users", userData);

    return res.status(201).json({
      id: userDoc.id,
      uid: newUser.uid,
      email: newUser.email,
      firstName: firstName,
      lastName: lastName,
      displayName: newUser.displayName,
      phone: phone,
      role: role,
      profilePicture: profilePicture,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        error: "EmailAlreadyExists",
        message: generalDictionary(language, "EmailAlreadyExists"),
      });
    }

    return res.status(500).json({
      error: "InternalServerError",
      message: generalDictionary(language, "InternalServerError"),
    });
  }
});

router.put("/user/:id", userSchema.put, async (req, res) => {
  if (validationErrorsExpress(req, res)) return;

  const language = req?.query?.lang;
  const {id} = req.params;
  const {firstName, lastName, email, phone, role, profilePicture} = req.body;

  try {
    const userDoc = await getDocument("users", id);

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "UserNotFound",
        message: generalDictionary(language, "UserNotFound"),
      });
    }

    const currentUserData = userDoc.data();

    const updateData = {
      firstName: firstName || currentUserData.firstName,
      lastName: lastName || currentUserData.lastName,
      email: email || currentUserData.email,
      phone: phone !== undefined ? phone : currentUserData.phone,
      role: role || currentUserData.role,
      profilePicture:
        profilePicture !== undefined
          ? profilePicture
          : currentUserData.profilePicture,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (firstName || lastName) {
      updateData.displayName = `${updateData.firstName} ${updateData.lastName}`;
    }

    if (currentUserData.uid && (email || firstName || lastName)) {
      try {
        const authUpdateData = {};
        if (email && email !== currentUserData.email) {
          authUpdateData.email = email;
        }
        if (firstName || lastName) {
          authUpdateData.displayName = updateData.displayName;
        }

        if (Object.keys(authUpdateData).length > 0) {
          await admin.auth().updateUser(currentUserData.uid, authUpdateData);
        }
      } catch (authError) {
        console.error("Error updating user in Firebase Auth:", authError);
        if (authError.code === "auth/email-already-exists") {
          return res.status(409).json({
            error: "EmailAlreadyExists",
            message: generalDictionary(language, "EmailAlreadyExists"),
          });
        }
        throw authError;
      }
    }

    await updateDocument("users", id, updateData);

    const updatedUser = await getDocument("users", id);
    const updatedUserData = updatedUser.data();

    return res.status(200).json({
      id: id,
      uid: updatedUserData.uid,
      email: updatedUserData.email,
      firstName: updatedUserData.firstName,
      lastName: updatedUserData.lastName,
      displayName: updatedUserData.displayName,
      phone: updatedUserData.phone,
      role: updatedUserData.role,
      profilePicture: updatedUserData.profilePicture,
      updatedAt: updatedUserData.updatedAt,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    return res.status(500).json({
      error: "InternalServerError",
      message: generalDictionary(language, "InternalServerError"),
    });
  }
});

router.delete("/user/:id", userSchema.delete, async (req, res) => {
  if (validationErrorsExpress(req, res)) return;

  const language = req?.query?.lang;
  const {id} = req.params;

  try {
    const userDoc = await getDocument("users", id);

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "UserNotFound",
        message: generalDictionary(language, "UserNotFound"),
      });
    }

    const userData = userDoc.data();

    if (userData.uid) {
      try {
        await admin.auth().deleteUser(userData.uid);
      } catch (authError) {
        console.error("Error deleting user from Firebase Auth:", authError);
        if (authError.code !== "auth/user-not-found") {
          throw authError;
        }
      }
    }

    await deleteDocument("users", id);

    return res.status(200).json({
      message: generalDictionary(language, "UserDeletedSuccessfully"),
      deletedUser: {
        id: id,
        email: userData.email,
        displayName: userData.displayName,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    return res.status(500).json({
      error: "InternalServerError",
      message: generalDictionary(language, "InternalServerError"),
    });
  }
});

module.exports = router;
