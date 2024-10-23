const activityRoutes = require("./activity");
const dashboardRoutes = require('./dashboard');

async function routes(fastify, options) {
  fastify.register(activityRoutes);
  fastify.register(dashboardRoutes);
}

module.exports = routes;
