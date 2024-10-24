const routeValues = require("../config/routesValues");
const { userProfile } = require("../db");
const generateUniqueString = require("../utils/generateUniqueString");
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
    request.isValid = isValid[0];
    console.log(request.isValid);

    request.isValid["idevent_transaction"] = generateUniqueString();
    if (!isValid.length) {
      return reply
        .status(403)
        .send({ message: "You do not have permission to access this route." });
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = { eventValidation };
