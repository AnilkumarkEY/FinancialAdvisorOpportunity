const { userController } = require('../controllers');
const {eventValidation} = require("../middleware/eventValidation");
const {authentication} = require("../middleware/authentication")

async function userRoutes(fastify, options) {

  // Define user routes
  fastify.get('/users/get-users',{ preHandler: [authentication,eventValidation]}, userController.getUsers);
  fastify.post('/users/login', userController.loginUser);
  fastify.post('/users/forgot-password', userController.sendOtp);
  fastify.post('/users/change-password', userController.changePassword);
}

module.exports = userRoutes;
