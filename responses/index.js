function sendResponse(data) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: { data },
  };
}

function sendError(code, message) {
  return {
    statusCode: code,
    headers: {
      "Content-Type": "application/json",
    },
    body: { message },
  };
}

module.exports = { sendError, sendResponse };
