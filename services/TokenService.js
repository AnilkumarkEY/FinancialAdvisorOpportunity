const dotenv = require("dotenv"); // For managing environment variables
const axios = require("axios");
const qs = require("qs");
dotenv.config();

async function getUserAccessToken(login) {
  try {
    const tokenResponse = {};
    const data = qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: process.env.GRANT_PASSWORD_TYPE,
      scope: process.env.SCOPE,
      username: login.userName,
      password: login.password,
    });

    const response = await axios.post(process.env.AD_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    Object.assign(tokenResponse, response.data);
    return tokenResponse;
  } catch (error) {
    console.error(`EXCEPTION ON LOGIN- : ${error.message}`);
    return error;
  }
}

module.exports = {
  getUserAccessToken,
};
