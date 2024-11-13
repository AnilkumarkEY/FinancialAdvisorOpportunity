const { dashboardController } = require("../controllers");
const { eventValidation } = require("../middleware/eventValidation");
const { authentication } = require("../middleware/authentication");

async function dashboardRoutes(fastify, options) {
  // Define dashboard routes
  fastify.get(
    "/lead-type-overview",
    { preHandler: [authentication, eventValidation] },
    dashboardController.getLeadCountByType
  );
  fastify.get(
    "/lead-status-overview",
    { preHandler: [authentication, eventValidation] },
    dashboardController.getLeadStatusCount
  );
  fastify.post(
    "/get-status-wise-lead-list",
    { preHandler: [authentication, eventValidation] },
    dashboardController.getLeadsByStatusWithPagination
  );
  fastify.put(
    "/update-lead-type",
    { preHandler: [authentication, eventValidation] },
    dashboardController.updateLeadType
  );
  fastify.put(
    "/update-lead-status",
    { preHandler: [authentication, eventValidation] },
    dashboardController.updateLeadStatus
  );
  fastify.post(
    "/lead-list-search",
    { preHandler: [authentication, eventValidation] },
    dashboardController.leadListSearch
  );
}

module.exports = dashboardRoutes;
