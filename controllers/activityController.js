const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const generateUniqueString = require("../utils/generateUniqueString")
const { activity, userProfile } = require("../db");

exports.getActivity = async (request, reply) => {
  try {
    // Extract the idlead from the request parameters or query (depends on how the frontend sends it)
    const { idlead } = request.query;
    console.log(request.query);

    if (!idlead) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(
            STATUS_CODES.BAD_REQUEST,
            "Missing idlead parameter"
          )
        );
    }

    // Fetch activity data from the database
    const activities = await activity.fetchActivity(idlead);

    if (activities && activities.length > 0) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "Activity data retrieved successfully",
            activities
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No activity data found", {}));
    }
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};

exports.insertActivity = async (request, reply) => {
  try {
    // Extracting the values from the request body
    const activityData = request.body;
    activityData.idactivity = generateUniqueString();
    const createActivity = await activity.createActivity(activityData);
    // Returning the inserted idactivity as the result
    console.log(createActivity);

    if (createActivity) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(STATUS_CODES.OK, "Activity inserted successfully")
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(STATUS_CODES.OK, "An unexpected error occurred", {})
        );
    }
  } catch (err) {
    console.error("Error executing insert query", err.stack);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};
