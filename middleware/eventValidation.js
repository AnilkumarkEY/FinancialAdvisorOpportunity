async function eventValidation(request, reply) {
    // Perform validation logic here
    const isValid = true;
    if(!isValid){
        return reply.status(403).send({ message: 'You do not have permission to access this route.' });
    }
  }
  
module.exports = { eventValidation };
