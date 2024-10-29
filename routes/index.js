const activityRoutes = require("./activity");
const dashboardRoutes = require('./dashboard');

async function routes(fastify, options) {
  fastify.register(activityRoutes,{ prefix: "/activity" });
  fastify.register(dashboardRoutes,{ prefix: "/dashboard" });
}

module.exports = routes;
