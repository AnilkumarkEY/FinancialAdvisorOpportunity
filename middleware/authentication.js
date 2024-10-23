const { userProfile } = require("../db");
const STATUS_CODES = require("../utils/statusCodes");
const responseFormatter = require("../utils/responseFormatter");

const authentication = async (request, reply) => {
  const accessToken = request.headers["authorization"]?.split(" ")[1];
  if (!accessToken) {
    return reply
      .status(STATUS_CODES.UNAUTHORIZED)
      .send(responseFormatter(STATUS_CODES.UNAUTHORIZED, "No token provided!"));
  }

  try {
    const jwtToken = accessToken.split(".");
    // Decode the JWT token
    const decoded = JSON.parse(
      Buffer.from(jwtToken[1], "base64").toString("utf8")
    );
    const checkActiveFlag = await userProfile.checkActiveFlag(decoded.oid);
    if (checkActiveFlag[0]?.activeflag) {
      await userProfile.insertSessionData(
        decoded.oid,
        decoded.uti,
        decoded.exp
      );
      request.user = decoded;
    } else {
      return reply
        .status(STATUS_CODES.FORBIDDEN)
        .send(
          responseFormatter(
            STATUS_CODES.FORBIDDEN,
            "Access denied: User is inactive."
          )
        );
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return reply
      .status(STATUS_CODES.FORBIDDEN)
      .send(
        responseFormatter(
          STATUS_CODES.FORBIDDEN,
          "Failed to authenticate token."
        )
      );
  }
};

module.exports = { authentication };
