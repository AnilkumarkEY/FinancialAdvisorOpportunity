const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const { leadData, userProfile } = require("../db");

exports.getLeadCountByType = async (request, reply) => {
  try {
    const leads = await leadData.getLeadTypeData(request.isValid.identity);
    const formattedData = leads.reduce((acc, lead) => {
      if (lead.lead_type === "Hot") {
        acc.hotType = lead.lead_type;
        acc.hotMetaId = lead.lead_meta_data;
        acc.hotCount = parseInt(lead.lead_count, 10);
      } else if (lead.lead_type === "Cold") {
        acc.coldType = lead.lead_type;
        acc.coldMetaId = lead.lead_meta_data;
        acc.coldCount = parseInt(lead.lead_count, 10);
      } else if (lead.lead_type === "Warm") {
        acc.warmType = lead.lead_type;
        acc.warmMetaId = lead.lead_meta_data;
        acc.warmCount = parseInt(lead.lead_count, 10);
      }
      return acc;
    }, {});
    await userProfile.insertEventTransaction(request.isValid);
    return reply
      .status(STATUS_CODES.OK)
      .send(
        responseFormatter(
          STATUS_CODES.OK,
          "Lead counts by type retrieved successfully",
          formattedData
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

exports.getLeadStatusCount = async (request, reply) => {
  try {
    const processedLeadsStatus = [];
    let inProgressCount = 0;
    const leads = await leadData.getLeadStatusData(request.isValid.identity);
    leads.forEach((lead) => {
      const storedLeadStatus = {
        metaData: lead.lead_meta_status_data,
        status: lead.lead_status,
        count: parseInt(lead.lead_status_count),
      };
      if (
        [
          "Contacted",
          "Interested",
          "Qualified",
          "Proposal Sent",
          "Negotiation",
        ].includes(lead.lead_status)
      ) {
        inProgressCount += storedLeadStatus.count;
      } else {
        processedLeadsStatus.push(storedLeadStatus);
      }
    });
    processedLeadsStatus.push({
      metaData: "",
      status: "In progress",
      count: inProgressCount,
    });
    await userProfile.insertEventTransaction(request.isValid);
    return reply
      .status(STATUS_CODES.OK)
      .send(
        responseFormatter(
          STATUS_CODES.OK,
          "Lead counts by type retrieved successfully",
          { leadStatusRes: processedLeadsStatus }
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

exports.getLeadsByStatusWithPagination = async (request, reply) => {
  try {
    const { leadStatus } = request.body;
    if (!leadStatus) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(STATUS_CODES.BAD_REQUEST, "Status is required")
        );
    }
    const leads = await leadData.allLeads(request.isValid.identity, leadStatus);
    console.log(leads);
    if (leads) {
      await userProfile.insertEventTransaction(request.isValid);
      return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "Leads retrieved successfully",
            leads
          )
        );
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "No data found"));
    }
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
