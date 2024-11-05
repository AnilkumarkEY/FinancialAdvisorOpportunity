const { activityController } = require("../controllers");
const { eventValidation } = require("../middleware/eventValidation");
const { authentication } = require("../middleware/authentication");

async function activityRoutes(fastify, options) {
  // Define user routes
  fastify.get(
    "/fetch-meeting",
    { preHandler: [authentication, eventValidation] },
    activityController.getActivity
  );
  fastify.post(
    "/create-meeting",
    { preHandler: [authentication, eventValidation] },
    activityController.insertActivity
  );
  fastify.delete(
    "/delete-meeting",
    { preHandler: [authentication, eventValidation] },
    activityController.deleteActivity
  );
  fastify.post(
    "/follow-up-meeting",
    { preHandler: [authentication, eventValidation] },
    activityController.insertActivity
  );
  fastify.put(
    "/modify-meeting",
    { preHandler: [authentication, eventValidation] },
    activityController.updateActivity
  );
  fastify.delete(
    "/delete-meeting-all",
    { preHandler: [authentication, eventValidation] },
    activityController.deleteAllActivity
  );
  fastify.get(
    "/fetch-diary",
    { preHandler: [authentication, eventValidation] },
    activityController.getActivity
  );
  fastify.post(
    "/create-diary",
    { preHandler: [authentication, eventValidation] },
    activityController.insertActivity
  );
  fastify.put(
    "/modify-diary",
    { preHandler: [authentication, eventValidation] },
    activityController.updateActivity
  );
  fastify.delete(
    "/delete-diary",
    { preHandler: [authentication, eventValidation] },
    activityController.deleteActivity
  );
  fastify.get(
    "/get-reasons",
    { preHandler: [authentication, eventValidation] },
    activityController.getReasons
  );
  fastify.put(
    "/lead-not-contactable",
    { preHandler: [authentication, eventValidation] },
    activityController.changeStatusToNotContactable
  );
  fastify.delete(
    "/delete-lead",
    { preHandler: [authentication, eventValidation] },
    activityController.deleteLead
  );
}

module.exports = activityRoutes;
