const { activityController } = require("../controllers");
const {eventValidation} = require("../middleware/eventValidation");
const {authentication} = require("../middleware/authentication")

async function activityRoutes(fastify, options) {
  // Define user routes
  fastify.get(
    "/activity/fetch-activity",
    { preHandler: [authentication, eventValidation] },
    activityController.getActivity
  );
  fastify.post("/activity/create-activity", { preHandler: [authentication, eventValidation] } ,activityController.insertActivity);
}

module.exports = activityRoutes;
