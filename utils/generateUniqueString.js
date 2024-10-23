const crypto = require("crypto");

const generateUniqueString = () => {
  return crypto.randomBytes(16).toString("hex"); // Generates a 32-character hex string
};

module.exports = generateUniqueString;
