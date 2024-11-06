const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const generateUniqueString = require("../utils/generateUniqueString");
const { activity, userProfile } = require("../db");
const moment = require("moment");

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
      const processActivities = async (activities) => {
        return activities.map((activity) => {
          // Format the start and end date/time
          const startDateFormatted = activity.activity_start_date
            ? moment(activity.activity_start_date).format("DD/MM/YYYY")
            : null;

          const startTimeFormatted = activity.activity_start_date
            ? moment(activity.activity_start_date).format("HH:mm")
            : null;

          const endDateFormatted = activity.activity_end_date
            ? moment(activity.activity_end_date).format("DD/MM/YYYY")
            : startDateFormatted; // If endDate is null, use startDate

          const endTimeFormatted = activity.activity_end_date
            ? moment(activity.activity_end_date).format("HH:mm")
            : startTimeFormatted; // If endTime is null, use startTime

          // Add the formatted fields to each activity
          return {
            ...activity, // Spread the existing fields
            startDateFormatted,
            startTime: startTimeFormatted,
            endDateFormatted,
            endTime: endTimeFormatted,
          };
        });
      };
      const processedActivities = await processActivities(activities);
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "Activity data retrieved successfully",
            processedActivities
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
    const { startDate, endDate, startTime, endTime } = activityData;
    let startDateTime, endDateTime;
    if (startDate && endDate && startTime && endTime) {
      startDateTime = moment(
        `${startDate} ${startTime}`,
        "DD/MM/YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss.SSS");
      endDateTime = moment(`${endDate} ${endTime}`, "DD/MM/YYYY HH:mm").format(
        "YYYY-MM-DD HH:mm:ss.SSS"
      );
    } else if (startDate && startTime && endTime) {
      startDateTime = moment(
        `${startDate} ${startTime}`,
        "DD/MM/YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss.SSS");
      endDateTime = moment(
        `${startDate} ${endTime}`,
        "DD/MM/YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss.SSS");
    } else if (endDate === "" && !startTime && !endTime) {
      startDateTime = moment(startDate, "DD/MM/YYYY").format(
        "YYYY-MM-DD HH:mm:ss.SSS"
      );
      endDateTime = startDateTime; // endDate is same as startDate
    }
    activityData.idactivity = generateUniqueString();
    activityData.createdBy = request.isValid.identity;
    activityData.activityEndDate = endDateTime;
    activityData.activityStartDate = startDateTime;
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
    const { startDate, endDate, startTime, endTime } = activityData;
    let startDateTime, endDateTime;
    if (startDate && endDate && startTime && endTime) {
      startDateTime = moment(
        `${startDate} ${startTime}`,
        "DD/MM/YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss.SSS");
      endDateTime = moment(`${endDate} ${endTime}`, "DD/MM/YYYY HH:mm").format(
        "YYYY-MM-DD HH:mm:ss.SSS"
      );
    } else if (startDate && startTime && endTime) {
      startDateTime = moment(
        `${startDate} ${startTime}`,
        "DD/MM/YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss.SSS");
      endDateTime = moment(
        `${startDate} ${endTime}`,
        "DD/MM/YYYY HH:mm"
      ).format("YYYY-MM-DD HH:mm:ss.SSS");
    } else if (endDate === "" && !startTime && !endTime) {
      startDateTime = moment(startDate, "DD/MM/YYYY").format(
        "YYYY-MM-DD HH:mm:ss.SSS"
      );
      endDateTime = startDateTime; // endDate is same as startDate
    }
    activityData.activity_start_date = startDateTime;
    activityData.activity_end_date = endDateTime;
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
      const reason = await activity.getReasonName(leadData.reason_meta_id);
      const activityData = {
        idactivity: generateUniqueString(),
        idLead: leadData.leadId,
        description: {
          previousLeadStatus: leadData.idmeta_lead_status,
          newLeadStatus: "eb50fefac7f147d09049ccd156679a66",
          previousLeadStatusName: leadData.leadstatus,
          newLeadStatusName: "Not Contacted",
          reason_meta_name: reason.meta_data_name,
          reason_meta_id: leadData.reason_meta_id,
          reason: "",
        },
        idmetaActivity: "e2e486d7a9824c13ab5c8764e24ee23d",
        createdBy: leadData.leadId,
      };
      if (leadData.reason_meta_name == "Other") {
        activityData.description.reason = leadData.description;
      }
      const activityCreated = await activity.createActivity(activityData);
      if (activityCreated) {
        await userProfile.insertEventTransaction(request.isValid);
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
      const reason = await activity.getReasonName(leadData.reason_meta_id);
      const activityData = {
        idactivity: generateUniqueString(),
        idLead: leadData.leadId,
        description: {
          previousStatus: "active",
          newStatus: "inactive",
          reason_meta_name: reason.meta_data_name,
          reason_meta_id: leadData.reason_meta_id,
          reason: "",
        },
        idmetaActivity: "e2e486d7a9824c13ab5c8764e24ee23d",
        createdBy: leadData.leadId,
      };
      if (leadData.reason_meta_name == "Other") {
        activityData.description.reason = leadData.description;
      }
      const activityCreated = await activity.createActivity(activityData);
      if (activityCreated) {
        await userProfile.insertEventTransaction(request.isValid);
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

exports.getActivities = async (request, reply) => {
  try {
    const { activityType } = request.query;
    if (!activityType) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(
            STATUS_CODES.BAD_REQUEST,
            "Missing activity parameter"
          )
        );
    }
    const activities = await activity.getActivities(activityType);
    if (activities.length) {
      const metaActivity = activities[0];
      const values = activities.map((row) => ({
        idmetadata: row.idmetadata,
        meta_data_name: row.meta_data_name,
      }));

      // Construct the response format
      const response = {
        idmetaActivity: metaActivity.idmetamaster,
        activityName: metaActivity.meta_master_name,
        values: values,
      };
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "Activities fetched successfully",
            response
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No activities found"));
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
