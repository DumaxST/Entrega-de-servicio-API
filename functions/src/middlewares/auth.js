const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

const {ClientError} = require("./errors/index");
require("dotenv").config();

const secretKeyJWT = process.env.JWT_SECRET;
const secretKeyRefresh = process.env.JWT_REFRESH_SECRET;

const validateToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  try {
    if (!token) {
      throw new ClientError(req.t("TokenNotFound"), 401);
    }
    jwt.verify(token, secretKeyJWT, (err, decoded) => {
      if (err) {
        throw new ClientError(req.t("InvalidOrExpiredToken"), 401);
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};

const validateRefreshToken = (req, res, next) => {
  const refreshTokenCookie = req.cookies?.refreshToken;

  try {
    if (!refreshTokenCookie) {
      throw new ClientError(req.t("RefreshTokenNotFound"), 401);
    }

    jwt.verify(refreshTokenCookie, secretKeyRefresh, (err, decoded) => {
      if (err) {
        throw new ClientError(req.t("InvalidOrExpiredToken"), 401);
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};

const validateAuthTokenFirebase = async (req, res, next) => {
  try {
   

    // Info del cliente
    const tokenAuth = req.body.tokenAuth;

    const decodedToken = await admin.auth().verifyIdToken(tokenAuth);

    if (!decodedToken) {
      throw new ClientError(req.t("InvalidTokenOrPwdEmail"), 401);
    }

    const user = await admin.auth().getUser(decodedToken.uid);

    if (!user) {
      throw new ClientError(req.t("UserNotFound"), 404);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};


module.exports = {
  validateToken,
  validateRefreshToken,
  validateAuthTokenFirebase,
};
