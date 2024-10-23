const { dashboardController } = require("../controllers");

async function dashboardRoutes(fastify, options) {
  // Define dashboard routes
  fastify.get(
    "/dashboard/leadTypeOverview",
    dashboardController.getLeadCountByType
  );
  fastify.get(
    "/dashboard/leadStatusOverview",
    dashboardController.getLeadStatusCount
  );
  fastify.post(
    "/dashboard/leadStatusWithPagination",
    dashboardController.getLeadsByStatusWithPagination
  );
}

module.exports = dashboardRoutes;
