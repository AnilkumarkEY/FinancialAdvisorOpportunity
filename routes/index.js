const activityRoutes = require("./activity");
const dashboardRoutes = require('./dashboard');
const homePageRoutes = require("./homepage");

async function routes(fastify, options) {
  fastify.register(activityRoutes,{ prefix: "/activity" });
  fastify.register(dashboardRoutes,{ prefix: "/dashboard" });
  fastify.register(homePageRoutes,{ prefix: "/homepage" });
}

module.exports = routes;
