const { db } = require("../../services/db.js");
const { sendError, sendResponse } = require("../../responses/index.js");

// fetch all the rooms from database
async function getRooms() {
  const { Items } = await db.scan({
    TableName: "Bonzai-rooms",
  });

  return Items;
}

// Return rooms in a response or handle error
exports.handler = async (event) => {
  try {
    const allRooms = await getRooms();
    return sendResponse(allRooms);
  } catch (error) {
    console.log("Error fetching all rooms", error);
    return sendError(500, "Internal server error: Unable to fetch rooms");
  }
};
