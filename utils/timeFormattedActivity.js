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
  // Get today's date, yesterday's date, and the date format for comparison
  const todayUTC = moment().utc().startOf("day");
  const yesterdayUTC = moment().utc().subtract(1, "days").startOf("day");

  // Grouped activities by day label (today, yesterday, earlier)
  const groupedActivities = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  // Process each activity and classify them into today, yesterday, or earlier
  activities.forEach((activity) => {
    const createdDate = moment(activity.created_date_utc).utc(); // Ensure UTC time zone for created_date_utc

    // Check if the activity was created today
    if (createdDate.isSame(todayUTC, "day")) {
      groupedActivities.today.push(activity);
    }
    // Check if the activity was created yesterday
    else if (createdDate.isSame(yesterdayUTC, "day")) {
      groupedActivities.yesterday.push(activity);
    }
    // Otherwise, it's considered "earlier"
    else {
      groupedActivities.earlier.push(activity);
    }
  });

  // Function to format and sort activities within a group
  const formatAndSortActivities = (activities) => {
    return activities
      .map((activity) => {
        // Create a moment object for activity's start date to format it
        const startDate = moment(activity.activity_start_date);
        const startDateFormatted = startDate.format("DD/MM/YYYY");
        const startTimeFormatted = startDate.format("hh:mm A"); // 12-hour format with AM/PM

        const endDateFormatted = activity.activity_end_date
          ? moment(activity.activity_end_date).format("DD/MM/YYYY")
          : startDateFormatted; // If endDate is null, use startDate

        const endTimeFormatted = activity.activity_end_date
          ? moment(activity.activity_end_date).format("hh:mm A") // 12-hour format with AM/PM
          : startTimeFormatted; // If endTime is null, use startTime

        // Convert created_date_utc from UTC to local time, then format it to 12-hour format with AM/PM
        const createdDate = moment(activity.created_date_utc).utc(); // Ensure UTC for createdDate
        const createdDateFormatted = createdDate.format("DD/MM/YYYY");

        // Convert to local time and then format as 12-hour time with AM/PM
        const createdTimeLocal = createdDate.local().format("hh:mm A"); // 12-hour format with AM/PM

        // Return a formatted activity with all necessary details
        return {
          ...activity, // Spread the existing fields
          startDateFormatted,
          startTime: startTimeFormatted,
          endDateFormatted,
          endTime: endTimeFormatted,
          createdDateFormatted, // Add formatted created date
          createdTime: createdTimeLocal, // Use local time for createdTime in 12-hour format with AM/PM
        };
      })
      .sort((a, b) =>
        moment(b.created_date_utc).isBefore(moment(a.created_date_utc)) ? -1 : 1
      ); // Sort by created_date_utc (descending)
  };

  // Format and sort activities for each group
  const todayActivities = formatAndSortActivities(groupedActivities.today);
  const yesterdayActivities = formatAndSortActivities(
    groupedActivities.yesterday
  );
  const earlierActivities = formatAndSortActivities(groupedActivities.earlier);

  // Prepare the result structure
  const result = [];

  if (todayActivities.length > 0) {
    result.push({
      day: "today",
      data: todayActivities,
    });
  }

  if (yesterdayActivities.length > 0) {
    result.push({
      day: "yesterday",
      data: yesterdayActivities,
    });
  }

  if (earlierActivities.length > 0) {
    result.push({
      day: "earlier",
      data: earlierActivities,
    });
  }

  // Return the result array
  return result;
};
