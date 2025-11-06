import "dotenv/config";
import {get} from "env-var";

export const envs = {
   
    fbStorageBucket: get("FB_STORAGE_BUCKET").default("gs://service-delivery-development.firebasestorage.app").asString(),

    jwtSecret: get("JWT_SECRET").default("development_jwt_secret").asString(),
    jwtRefreshSecret: get("JWT_REFRESH_SECRET").default("development_refresh_secret").asString(),
    wialonAccessToken: get("WIALON_ACCESS_TOKEN").default("").asString(),
    wialonUrl: get("WIALON_URL").default("").asString(),
    modo: get("MODO").default("development").asString()
};
