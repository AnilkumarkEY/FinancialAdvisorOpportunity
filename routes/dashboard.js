const { dashboardController } = require("../controllers");
const { eventValidation } = require("../middleware/eventValidation");
const { authentication } = require("../middleware/authentication");

async function dashboardRoutes(fastify, options) {
  // Define dashboard routes
  fastify.get(
    "/dashboard/lead-type-overview",
    { preHandler: [authentication, eventValidation] },
    dashboardController.getLeadCountByType
  );
  fastify.get(
    "/dashboard/lead-status-overview",
    { preHandler: [authentication, eventValidation] },
    dashboardController.getLeadStatusCount
  );
  fastify.post(
    "/dashboard/lead-status-with-pagination",
    { preHandler: [authentication, eventValidation] },
    dashboardController.getLeadsByStatusWithPagination
  );
}

module.exports = dashboardRoutes;
