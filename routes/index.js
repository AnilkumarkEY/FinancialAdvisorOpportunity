// const userRoutes = require('./user');
const dashboardRoutes = require('./dashboard');

async function routes(fastify, options) {
    // Register user and dashboard routes
    // fastify.register(userRoutes);
    fastify.register(dashboardRoutes);
}

module.exports = routes;
