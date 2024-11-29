const { homePageController } = require("../controllers");
const { eventValidation } = require("../middleware/eventValidation");
const { authentication } = require("../middleware/authentication");

async function homePageRoutes(fastify, options) {
  // Define user routes
  fastify.get(
    "/get-overview-counts",
    { preHandler: [authentication, eventValidation] },
    homePageController.getOverviewCounts // to be modified
  );
}

module.exports = homePageRoutes;
