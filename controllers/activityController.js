const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const generateUniqueString = require("../utils/generateUniqueString");
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
    activityData.createdBy = request.isValid.identity;
    activityData.activityEndDate = activityData.endTimeStamp;
    activityData.activityStartDate = activityData.startTimeStamp;
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

exports.deleteActivity = async (request, reply) => {
  try {
    const { idlead, idactivity } = request.body;
    if (!idlead || !idactivity) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(
            STATUS_CODES.BAD_REQUEST,
            "Missing idlead or idactivity"
          )
        );
    }
    // Fetch activity data from the database
    const isActivityDeleted = await activity.deleteActivity(idlead, idactivity);
    if (isActivityDeleted) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(STATUS_CODES.OK, "Activity deleted successfully")
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No activity data found"));
    }
  } catch (error) {
    console.error("Error executing insert query", error.stack);
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

exports.deleteAllActivity = async (request, reply) => {
  try {
    const { idlead } = request.body;
    if (!idlead) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(responseFormatter(STATUS_CODES.BAD_REQUEST, "Missing idlead"));
    }
    // Fetch activity data from the database
    const isActivityDeleted = await activity.deleteAllActivities(idlead);
    if (isActivityDeleted) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(STATUS_CODES.OK, "Activities deleted successfully")
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No activity data found"));
    }
  } catch (error) {
    console.error("Error executing insert query", error.stack);
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

exports.updateActivity = async (request, reply) => {
  try {
    const activityData = request.body;
    activityData.identity = request.isValid.identity;
    const isUpdatedActivity = await activity.updateActivity(activityData);
    if (isUpdatedActivity) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(STATUS_CODES.OK, "Activity updated successfully")
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No activity data found"));
    }
  } catch (error) {
    console.error("Error executing insert query", error.stack);
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
