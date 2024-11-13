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

exports.processTimelines = async (activities) => {
  const today = moment().startOf("day"); // Get today's date without time for comparison
  const yesterday = moment().subtract(1, "days").startOf("day"); // Get yesterday's date without time for comparison
  const groupedActivities = [];

  // Filter out activities that are from the future
  const validActivities = activities.filter((activity) => {
    const activityDate = moment(activity.activity_start_date);
    return activityDate.isSameOrBefore(today); // Only consider activities up to today
  });

  validActivities.forEach((activity) => {
    const startDate = moment(activity.activity_start_date); // Start date of the activity

    // Normalize the start date to remove time component
    const startDateNormalized = startDate.startOf("day");

    // Calculate the difference in days from today
    const daysDifference = startDateNormalized.diff(today, "days");

    let dayLabel;

    // Determine the label for the day
    if (daysDifference === 0) {
      dayLabel = "today";
    } else if (daysDifference === -1) {
      dayLabel = "yesterday";
    }

    // Skip if the activity is not "today" or "yesterday"
    if (!dayLabel) return;

    // Format the start and end date/time in 12-hour format with AM/PM
    const startDateFormatted = activity.activity_start_date
      ? startDate.format("DD/MM/YYYY")
      : null;

    const startTimeFormatted = activity.activity_start_date
      ? startDate.format("hh:mm A") // 12-hour format with AM/PM
      : null;

    const endDateFormatted = activity.activity_end_date
      ? moment(activity.activity_end_date).format("DD/MM/YYYY")
      : startDateFormatted; // If endDate is null, use startDate

    const endTimeFormatted = activity.activity_end_date
      ? moment(activity.activity_end_date).format("hh:mm A") // 12-hour format with AM/PM
      : startTimeFormatted; // If endTime is null, use startTime

    const formattedActivity = {
      ...activity, // Spread the existing fields
      startDateFormatted,
      startTime: startTimeFormatted,
      endDateFormatted,
      endTime: endTimeFormatted,
    };

    // Check if the dayLabel already exists in the groupedActivities array
    let dayGroup = groupedActivities.find((group) => group.day === dayLabel);

    // If the group doesn't exist, create a new one
    if (!dayGroup) {
      dayGroup = { day: dayLabel, data: [] };
      groupedActivities.push(dayGroup);
    }

    // Push the activity to the correct day group
    dayGroup.data.push(formattedActivity);
  });

  // Sort the groupedActivities array based on the created_date_utc
  groupedActivities.forEach((group) => {
    group.data.sort((a, b) =>
      moment(b.created_date_utc).isBefore(moment(a.created_date_utc)) ? 1 : -1
    );
  });

  // Reverse the order to get the most recent activity first
  groupedActivities.reverse();

  return groupedActivities;
};

// function extractDayValue(dayLabel) {
//   if (dayLabel === "today") {
//     return 0;
//   }
//   if (dayLabel === "tomorrow") {
//     return 1;
//   }
//   if (dayLabel === "yesterday") {
//     return -1;
//   }
//   const match = dayLabel.match(/(\d+) day/);
//   if (match && match[1]) {
//     return parseInt(match[1], 10) * (dayLabel.includes("earlier") ? -1 : 1);
//   }
//   return 0;
// }
