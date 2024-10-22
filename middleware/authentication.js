const authentication = async (request, reply) => {
  const accessToken = request.headers["authorization"]?.split(" ")[1];
  if (!accessToken) {
    return reply.status(401).send({ message: "No token provided!" });
  }
  
  try {
    const jwtToken = accessToken.split(".");
    // Decode the JWT token
    const decoded = JSON.parse(
      Buffer.from(jwtToken[1], "base64").toString("utf8")
    );
    request.user = decoded; // Attach the user data to the request object
    console.log(request.user);
  } catch (err) {
    return reply.status(403).send({ message: "Failed to authenticate token." });
  }
};

module.exports = { authentication };