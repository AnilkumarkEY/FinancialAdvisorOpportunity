const { dashboardController } = require('../controllers');
const {eventValidation} = require("../middleware/eventValidation");
const {authentication} = require("../middleware/authentication")

async function dashboardRoutes(fastify, options) {
    // Define dashboard routes
    fastify.get('/dashboard/leadTypeOverview', { preHandler: [authentication, eventValidation] }, dashboardController.getLeadCountByType);
    fastify.get('/dashboard/leadStatusOverview', { preHandler: [authentication, eventValidation] }, dashboardController.getLeadStatusCount);
    fastify.post('/dashboard/leadStatusWithPagination', { preHandler: [authentication, eventValidation] }, dashboardController.getLeadsByStatusWithPagination);
}

module.exports = dashboardRoutes;
