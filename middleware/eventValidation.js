const routeValues = require("../config/routesValues");
const { userProfile } = require("../db");
const generateUniqueString = require("../utils/generateUniqueString");
const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
async function eventValidation(request, reply) {
  try {
    let route = request.url;
    if (route.includes("?")) {
      route = route.split("?")[0];
    } else {
      route;
    }
    console.log(route, "req-url");
    let eventDefination = routeValues.routeValues[route];
    const isValid = await userProfile.checkValidRoute(
      request.user.oid,
      eventDefination
    );
    if (!isValid.length) {
      return reply
        .status(STATUS_CODES.FORBIDDEN)
        .send(
          responseFormatter(
            STATUS_CODES.FORBIDDEN,
            "You do not have permission to access this route."
          )
        );
    } else {
      request.isValid = isValid[0];
      request.isValid["idevent_transaction"] = generateUniqueString();
      request.route = route;
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = { eventValidation };
