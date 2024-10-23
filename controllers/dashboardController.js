const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
let leadData = require("../db/lead")


exports.getLeadCountByType = async (request, reply) => {
    try {
            const processedLeads = [];
        
            const leads = await leadData.getLeadTypeData();
        
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
    
    exports.getLeadStatusCount = async (request, reply) => {
      try {
        const processedLeadsStatus = [];
        let inProgressCount = 0; 
    
        const leads = await leadData.getLeadStatusData();
    
        leads.forEach((lead) => {
          const storedLeadStatus = {
            metaData: lead.lead_meta_status_data,
            status: lead.lead_status,
            count: parseInt(lead.lead_status_count) 
          };
    
        
          if (['Contacted', 'Interested', 'Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.lead_status)) {
            inProgressCount += storedLeadStatus.count; 
          } else {
            processedLeadsStatus.push(storedLeadStatus); 
          }
        });
    
        
        processedLeadsStatus.push({
          metaData: "", 
          status: "In progress",
          count: inProgressCount
        });
    
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
        const { status} = request.body;
        // const { status, page = 1, pageSize = 10 } = request.body;
        const storeAllLeadData = []
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
    
        leads.forEach((lead) => {
          const storedLeadData = {
            full_name : lead.fullname,
            mobile_no: lead.mobile,
            type: lead.idmeta_lead_type,
            status : lead.idmeta_lead_status
          };
          storeAllLeadData.push(storedLeadData);
        });
        
        
    
        // Pagination logic
        // const totalLeads = filteredLeads.length;
        // const totalPages = Math.ceil(totalLeads / pageSize);
        // const offset = (page - 1) * pageSize;
        // const paginatedLeads = filteredLeads.slice(offset, offset + pageSize);
    
        return reply.status(STATUS_CODES.OK).send(
          responseFormatter(STATUS_CODES.OK, "Leads retrieved successfully", {
            // total: totalLeads,
            // totalPages: totalPages,
            // currentPage: page,
            // pageSize: pageSize,
            data: storeAllLeadData,
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
    
    