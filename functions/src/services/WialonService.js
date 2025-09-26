const axios = require("axios");
const qs = require("querystring");

class WialonService {
  constructor() {
    this.baseURL = "https://hst-api.wialon.com";
    this.clientId = "Wialon Hosting | Platform for GPS tracking and IoT";
    this.redirectUri = "http://localhost:3000/callback";
  }

  generateAuthURL(username, password) {
    const params = {
      wialon_sdk_url: this.baseURL,
      client_id: this.clientId,
      access_type: -1,
      activation_time: 0,
      duration: 0,
      flags: 7,
      response_type: "token",
      login: username,
      passw: password,
      redirect_uri: `${this.redirectUri}&lang=en`,
      request_id: 1
    };

    return `${this.baseURL}/oauth/authorize.html?${qs.stringify(params)}`;
  }

  extractTokenFromCallback(callbackURL) {
    try {
      const url = new URL(callbackURL);
      const accessToken = url.searchParams.get("access_token");
      const userName = url.searchParams.get("user_name");
      const svcError = url.searchParams.get("svc_error");

      if (svcError !== "0") {
        throw new Error(`Wialon service error: ${svcError}`);
      }

      if (!accessToken) {
        throw new Error("Access token not found in callback URL");
      }

      return {
        accessToken,
        userName,
        success: true
      };
    } catch (error) {
      throw new Error(`Error parsing callback URL: ${error.message}`);
    }
  }

  async loginWithToken(accessToken) {
    try {
      const params = {
        token: accessToken
      };

      const response = await axios.get(`${this.baseURL}/wialon/ajax.html`, {
        params: {
          svc: "token/login",
          params: JSON.stringify(params)
        }
      });

      if (response.data.error) {
        throw new Error(`Wialon login error: ${response.data.error}`);
      }

      return {
        sid: response.data.eid,
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(`Error during token login: ${error.message}`);
    }
  }

  async getFullAuthenticationFlow(username, password) {
    try {
      const authURL = this.generateAuthURL(username, password);
      
      const response = await axios.get(authURL, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      const location = response.headers.location;
      if (!location) {
        throw new Error("No redirect location found in response");
      }

      const tokenData = this.extractTokenFromCallback(location);
      const loginResult = await this.loginWithToken(tokenData.accessToken);

      return {
        accessToken: tokenData.accessToken,
        userName: tokenData.userName,
        sid: loginResult.sid,
        success: true
      };
    } catch (error) {
      if (error.response && error.response.status === 302) {
        const location = error.response.headers.location;
        const tokenData = this.extractTokenFromCallback(location);
        const loginResult = await this.loginWithToken(tokenData.accessToken);

        return {
          accessToken: tokenData.accessToken,
          userName: tokenData.userName,
          sid: loginResult.sid,
          success: true
        };
      }
      throw error;
    }
  }
}

module.exports = WialonService;