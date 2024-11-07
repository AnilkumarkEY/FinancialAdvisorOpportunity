const moment = require("moment");

exports.processActivities = async (activities) => {
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
