// Som receptionist vill jag kunna se alla bokningar som gjorts för att få en överblick över hur beläggningen av hotellet ser ut.
const { db } = require("../../services/db.js");
const { sendError, sendResponse } = require("../../responses/index.js");

async function getBooking() {
    const {Items} = await db.scan({
        TableName: 'Bonzai-booking' 
    })
    return Items
}

exports.handler = async (event) => {
  
    const bookings = await getBooking()

  try {
 
    return sendResponse({message: 'success', bookings})
  } catch (error) {
    console.error("Error retrieving bookings: ", error);
    return sendError(500, {
      message: "An error occurred while retrieving the bookings",
      error: error.toString(),
    });
  }
};

