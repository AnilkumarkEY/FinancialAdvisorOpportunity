const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
let leadData = require("../db/lead")


exports.getLeadCountByType = async (request, reply) => {
try {
        const processedLeads = [];
    
        const leads = await leadData.getLeadData();
    
        leads.forEach((lead) => {
          const storedLead = {
            metaData: lead.lead_meta_data,
            type: lead.lead_type,
            count: parseInt(lead.lead_count) // Convert to integer
          };
          processedLeads.push(storedLead);
        });
    
        return reply
          .status(STATUS_CODES.OK)
          .send(
            responseFormatter(
              STATUS_CODES.OK,
              "Lead counts by type retrieved successfully",
             { leadTypeRes:processedLeads}
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

exports.getLeadStatusCount = async(request,reply)=>{
  try {
    const leadStatusCounts = { "Not Interested": 0, New: 0 , Inprogress:0, "Not Contactable":0};
    const leads = await leadData.getLeadData();
    const statusSet = new Set(["Not Interested", "New", "Inprogress"]);

    leads.forEach((lead) => {
      if (statusSet.has(lead.type)) {
        if( lead.type == "Contacted" || lead.type == "Interested" || lead.type == "Qualified" || lead.type == "Proposal Sent" || lead.type == "Negotiation" &&(lead.type != "Hot" || lead.type != "Warm" || lead.type != "Cold"))
        leadStatusCounts[lead.type == "In progress"]++;
      }
      else{
        leadStatusCounts[lead.type]++;
      }
    });
console.log(statusSet)
    const leadStatusRes = Object.entries(leadStatusCounts).map(([status, count]) => ({
      status,
      count,
    }));
    return reply
      .status(STATUS_CODES.OK)
      .send(
        responseFormatter(
          STATUS_CODES.OK,
          "Lead counts by type retrieved successfully",
         { leadStatusRes :leadStatusRes}
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
}


exports.getLeadsByStatusWithPagination = async (request, reply) => {
  try {
    const { status, page = 1, pageSize = 10 } = request.body;
    // Validate request body
    if (!status) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(STATUS_CODES.BAD_REQUEST, "Status is required")
        );
    }

    // Filter leads by status
    
    const leads = await leadData.allLeads()
    console.log(leads);
    
    // const filteredLeads = leads.filter((lead) => lead.type === status);
    const filteredLeads = leads.filter((lead) => {
      console.log(`Evaluating lead: ${JSON.stringify(lead)}, Status: ${status}`);
      return lead.type === status;
    });
    

    // Pagination logic
    const totalLeads = filteredLeads.length;
    const totalPages = Math.ceil(totalLeads / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedLeads = filteredLeads.slice(offset, offset + pageSize);

    return reply.status(STATUS_CODES.OK).send(
      responseFormatter(STATUS_CODES.OK, "Leads retrieved successfully", {
        total: totalLeads,
        totalPages: totalPages,
        currentPage: page,
        pageSize: pageSize,
        data: paginatedLeads,
      })
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
