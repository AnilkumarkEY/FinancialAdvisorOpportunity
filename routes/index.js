// const userRoutes = require('./user');
// const dashboardRoutes = require('./dashboard');
const activityRoutes = require("./activity");

async function routes(fastify, options) {
  // Register user and dashboard routes
  fastify.register(activityRoutes);
  // fastify.register(userRoutes);
  // fastify.register(dashboardRoutes);
}

module.exports = routes;
