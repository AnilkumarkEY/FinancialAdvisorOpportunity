const responseFormatter = (statusCode, message, data = null) => {
  return {
    status: statusCode,
    message: message,
    data: data,
  };
};

module.exports = responseFormatter;
