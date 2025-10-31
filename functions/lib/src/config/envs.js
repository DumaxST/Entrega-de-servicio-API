"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = void 0;
require("dotenv/config");
const env_var_1 = require("env-var");
exports.envs = {
    fbStorageBucket: (0, env_var_1.get)("FB_STORAGE_BUCKET").default("gs://service-delivery-development.firebasestorage.app").asString(),
    jwtSecret: (0, env_var_1.get)("JWT_SECRET").default("development_jwt_secret").asString(),
    jwtRefreshSecret: (0, env_var_1.get)("JWT_REFRESH_SECRET").default("development_refresh_secret").asString(),
    wialonAccessToken: (0, env_var_1.get)("WIALON_ACCESS_TOKEN").default("").asString(),
    wialonUrl: (0, env_var_1.get)("WIALON_URL").default("").asString(),
    modo: (0, env_var_1.get)("MODO").default("development").asString()
};
//# sourceMappingURL=envs.js.map