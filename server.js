const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const {connectToDatabase} = require("./config/db"); //uncommnet to connect db

const dotenv = require('dotenv'); // For managing environment variables
dotenv.config(); // Load environment variables from .env file
const PORT = parseInt(process.env.PORT) || 8081;
const routes = require('./routes/index');


fastify.register(cors, {
    origin: '*',  // Allow all origins (you can modify this to restrict origins)
});

fastify.register(routes);

// Start server
fastify.listen({ port: PORT },async (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    await connectToDatabase();
    fastify.log.info(`Server listening at ${address}`);
});

