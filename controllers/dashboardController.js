const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const { leadDB, userProfile, activity } = require("../db");
const generateUniqueString = require("../utils/generateUniqueString");

exports.getLeadCountByType = async (request, reply) => {
  try {
    const leads = await leadDB.getLeadTypeData(request.isValid.identity);
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

// exports.getLeadStatusCount = async (request, reply) => {
//   try {
//     const processedLeadsStatus = [];
//     let inProgressCount = 0;
//     const leads = await leadDB.getLeadStatusData(request.isValid.identity);
//     leads.forEach((lead) => {
//       const metaDetail = lead.meta_detail ? JSON.parse(lead.meta_detail) : {};
//       const storedLeadStatus = {
//         metaData: lead.lead_meta_status_data,
//         status: lead.lead_status,
//         count: parseInt(lead.lead_status_count, 10),
//         bgcolor: metaDetail.bgcolor || null,
//         icon: metaDetail.icon || null,
//       };
//       if (
//         [
//           "Contacted",
//           "Interested",
//           "Qualified",
//           "Proposal Sent",
//           "Negotiation",
//         ].includes(lead.lead_status)
//       ) {
//         inProgressCount += storedLeadStatus.count;
//       } else {
//         processedLeadsStatus.push(storedLeadStatus);
//       }
//     });
//     processedLeadsStatus.push({
//       metaData: process.env.INPROGRESSMETAID,
//       status: "In progress",
//       count: inProgressCount,
//       bgcolor: "#FFFFFF",
//       icon: process.env.INPROGRESSICON,
//     });
//     await userProfile.insertEventTransaction(request.isValid);
//     return reply
//       .status(STATUS_CODES.OK)
//       .send(
//         responseFormatter(
//           STATUS_CODES.OK,
//           "Lead counts by type retrieved successfully",
//           processedLeadsStatus
//         )
//       );
//   } catch (error) {
//     console.error(error);
//     return reply
//       .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
//       .send(
//         responseFormatter(
//           STATUS_CODES.INTERNAL_SERVER_ERROR,
//           "An unexpected error occurred"
//         )
//       );
//   }
// };
exports.getLeadStatusCount = async (request, reply) => {
  try {
    const processedLeadsStatus = [];
    let inProgressCount = 0;
    const leads = await leadDB.getLeadStatusData(request.isValid.identity);

    leads.forEach((lead) => {
      // Skip leads with status "Converted" and "Lost"
      if (["Converted", "Lost"].includes(lead.lead_status)) return;

      const metaDetail = lead.meta_detail ? JSON.parse(lead.meta_detail) : {};
      const storedLeadStatus = {
        metaData: lead.lead_meta_status_data,
        status: lead.lead_status,
        count: parseInt(lead.lead_status_count, 10),
        bgcolor: metaDetail.bgcolor || null,
        icon: metaDetail.icon || null,
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
      metaData: process.env.INPROGRESSMETAID,
      status: "In progress",
      count: inProgressCount,
      bgcolor: "#FFFFFF",
      icon: process.env.INPROGRESSICON,
    });

    await userProfile.insertEventTransaction(request.isValid);
    return reply
      .status(STATUS_CODES.OK)
      .send(
        responseFormatter(
          STATUS_CODES.OK,
          "Lead counts by type retrieved successfully",
          processedLeadsStatus
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
    const leadWithPagination = request.body;
    if (!leadWithPagination.leadStatus) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(STATUS_CODES.BAD_REQUEST, "Status is required")
        );
    }
    if (leadWithPagination.leadStatus == process.env.INPROGRESSMETAID) {
      const leadStatusList = await leadDB.inprogressLeadList(
        request.isValid.identity,
        leadWithPagination
      );
      if (leadStatusList.leads.length) {
        await userProfile.insertEventTransaction(request.isValid);
        return reply.status(STATUS_CODES.OK).send(
          responseFormatter(
            STATUS_CODES.OK,
            "Leads retrieved successfully",
            leadStatusList
            // {
            //   statusName: "inprogress",
            //   leadStatusList
            // }
          )
        );
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(
            responseFormatter(STATUS_CODES.OK, "No data found", leadStatusList)
          );
      }
    } else {
      const leads = await leadDB.allLeads(
        request.isValid.identity,
        leadWithPagination
      );
      const status = await leadDB.getStatusName(leadWithPagination.leadStatus);
      if (leads.leads.length) {
        await userProfile.insertEventTransaction(request.isValid);
        return reply.status(STATUS_CODES.OK).send(
          responseFormatter(
            STATUS_CODES.OK,
            "Leads retrieved successfully",
            leads
            // {
            //   statusName: status[0].meta_data_name,
            //   leads
            // }
          )
        );
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "No data found", leads));
      }
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

exports.updateLeadType = async (request, reply) => {
  try {
    const { idlead, idmeta_lead_type, reason } = request.body;
    const isUpdatedLeadType = await leadDB.updateLeadType(
      idlead,
      idmeta_lead_type,
      request.isValid.identity
    );
    if (isUpdatedLeadType) {
      const activityData = {
        idactivity: generateUniqueString(),
        idLead: idlead,
        activityStartDate: new Date(),
        description: reason,
        effToDate: new Date(),
        idmetaActivity: "1c65ee80e1cd47b997ce65bb1a9dffa0",
        createdBy: request.isValid.identity,
        createdDate: new Date(),
      };
      const isActivityCreated = await activity.createActivity(activityData);
      if (isActivityCreated) {
        await userProfile.insertEventTransaction(request.isValid);
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "Lead type updated"));
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(
            responseFormatter(
              STATUS_CODES.OK,
              "activity for lead type updation failed"
            )
          );
      }
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "Lead type not updated"));
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

exports.updateLeadStatus = async (request, reply) => {
  try {
    const { idlead, idmeta_lead_status, reason } = request.body;
    const isUpdatedLeadStatus = await leadDB.updateLeadStatus(
      idlead,
      idmeta_lead_status,
      request.isValid.identity
    );
    if (isUpdatedLeadStatus) {
      const activityData = {
        idactivity: generateUniqueString(),
        idLead: idlead,
        activityStartDate: new Date(),
        description: reason,
        effToDate: new Date(),
        idmetaActivity: "e2e486d7a9824c13ab5c8764e24ee23d",
        createdBy: request.isValid.identity,
        createdDate: new Date(),
      };
      const isActivityCreated = await activity.createActivity(activityData);
      if (isActivityCreated) {
        await userProfile.insertEventTransaction(request.isValid);
        return reply
          .status(STATUS_CODES.OK)
          .send(responseFormatter(STATUS_CODES.OK, "Lead status updated"));
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(
            responseFormatter(
              STATUS_CODES.OK,
              "activity for lead status updation failed"
            )
          );
      }
    } else {
      return reply
        .status(STATUS_CODES.OK)
        .send(responseFormatter(STATUS_CODES.OK, "Lead Status not updated"));
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

exports.leadListSearch = async (request, reply) => {
  try {
    const { searchQuery } = request.body;
    const leads = await leadDB.leadListSearch(
      searchQuery,
      request.isValid.identity
    );
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
        .send(responseFormatter(STATUS_CODES.OK, "Lead not found"));
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
