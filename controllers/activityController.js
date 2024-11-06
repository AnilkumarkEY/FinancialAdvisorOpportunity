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
        .send(responseFormatter(STATUS_CODES.OK, "No activity data found", []));
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
    console.error("Error executing", error.stack);
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

exports.getReasons = async (request, reply) => {
  try {
    const { reasonForStatus } = request.query;
    if (!reasonForStatus) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(
            STATUS_CODES.BAD_REQUEST,
            "Missing reason parameter"
          )
        );
    }
    let reasons;
    let metaDetailId;
    if (reasonForStatus == "notContactable") {
      metaDetailId = "eb50fefac7f147d09049ccd156679a66";
      reasons = await activity.getReasons(metaDetailId);
    } else if (reasonForStatus == "killLead") {
      metaDetailId = "54346b0f022e4e8aa2de80708441cc27";
      reasons = await activity.getReasons(metaDetailId);
    } else {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(STATUS_CODES.BAD_REQUEST, "Wrong reason parameter")
        );
    }
    if (reasons.length) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "Reasons fetched successfully",
            reasons
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No reasons found"));
    }
  } catch (error) {
    console.error("Error executing", error.stack);
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

exports.changeStatusToNotContactable = async (request, reply) => {
  try {
    const leadData = request.body;
    leadData.identity = request.isValid.identity;
    const isStatusUpdated = await activity.updateStatusNotContactable(leadData);
    if (isStatusUpdated) {
      const activityData = {
        idactivity: generateUniqueString(),
        idLead: leadData.leadId,
        description: {
          previousLeadStatus: leadData.idmeta_lead_status,
          newLeadStatus: "eb50fefac7f147d09049ccd156679a66",
          previousLeadStatusName: leadData.leadstatus,
          newLeadStatusName: "Not Contacted",
          reason_meta_name: leadData.reason_meta_name,
          reason_meta_id: leadData.reason_meta_id,
          reason: "",
        },
        idmetaActivity: "e2e486d7a9824c13ab5c8764e24ee23d",
        createdBy: leadData.leadId,
      };
      if (leadData.reason_meta_name == "other") {
        activityData.description.reason = leadData.description;
      }
      const activityCreated = await activity.createActivity(activityData);
      if (activityCreated) {
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "status updated"));
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "status not updated"));
      }
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "status not updated"));
    }
  } catch (error) {
    console.error("Error executing", error.stack);
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

exports.deleteLead = async (request, reply) => {
  try {
    const leadData = request.body;
    leadData.identity = request.isValid.identity;
    const isLeadDeleted = await activity.deleteLead(leadData);
    if (isLeadDeleted) {
      const activityData = {
        idactivity: generateUniqueString(),
        idLead: leadData.leadId,
        description: {
          previousStatus: "active",
          newStatus: "inactive",
          reason_meta_name: leadData.reason_meta_name,
          reason_meta_id: leadData.reason_meta_id,
          reason: "",
        },
        idmetaActivity: "e2e486d7a9824c13ab5c8764e24ee23d",
        createdBy: leadData.leadId,
      };
      if (leadData.reason_meta_name == "other") {
        activityData.description.reason = leadData.description;
      }
      const activityCreated = await activity.createActivity(activityData);
      if (activityCreated) {
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "lead deleted"));
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "lead not deleted"));
      }
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "lead not deleted"));
    }
  } catch (error) {
    console.error("Error executing", error.stack);
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
