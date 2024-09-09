const { db } = require("../../services/db.js");
const { nanoid } = require("nanoid");
const { sendError, sendResponse } = require("../../responses/index.js");

exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
    }),
  };
};
