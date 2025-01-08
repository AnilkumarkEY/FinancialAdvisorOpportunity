const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const { leadDB, userProfile, activity, homepageDB } = require("../db");
const generateUniqueString = require("../utils/generateUniqueString");

exports.getOverviewCounts = async (request, reply) => {
  try {
    const identity = request.isValid.identity;
    const newLeads = await homepageDB.getNewLeadCounts(identity);
    newLeads[0]["sortOrder"] = 1;
    const quotesCount = await homepageDB.quoteCount();
    quotesCount[0]["sortOrder"] = 2;
    const [draft, requirementPending, qcUW, decisionProvided] =
      await Promise.all([
        homepageDB.getApplicationTrackerDetails(true, 1),
        homepageDB.getApplicationTrackerDetails(true, 2),
        homepageDB.getApplicationTrackerDetails(true, 3),
        homepageDB.getApplicationTrackerDetails(true, 4),
      ]);
    const totalPremium = [
      draft,
      requirementPending,
      qcUW,
      decisionProvided,
    ].reduce((acc, item) => acc + parseFloat(item.totalpremium || 0), 0);

    const totalCount = [
      draft,
      requirementPending,
      qcUW,
      decisionProvided,
    ].reduce((acc, item) => acc + parseInt(item.count), 0);
    const processedCount = [
      newLeads[0],
      quotesCount[0],
      {
        customer_payouts_count: totalPremium,
        sortOrder: 3,
      },
      {
        application_count: totalCount,
        sortOrder: 4,
      },
    ];
    processedCount.sort((a, b) => a.sortOrder - b.sortOrder);
    await userProfile.insertEventTransaction(request.isValid);
    return reply
      .status(STATUS_CODES.OK)
      .send(
        responseFormatter(
          STATUS_CODES.OK,
          "Homepage overview counts",
          processedCount
        )
      );
  } catch (error) {
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
