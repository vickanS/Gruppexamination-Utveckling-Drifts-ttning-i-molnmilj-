// Som receptionist vill jag kunna se alla bokningar som gjorts för att få en överblick över hur beläggningen av hotellet ser ut.
const { db } = require("../../services/db.js");
const { sendError, sendResponse } = require("../../responses/index.js");

// Function to fetch bookings from the database
async function getBooking() {
  // Performs a scan operation on the Bonzai-booking table and retrieves all items
    const {Items} = await db.scan({
        TableName: 'Bonzai-booking' 
    })
    // Returns the fetched items
    return Items
}

exports.handler = async (event) => {
    // Retrieve bookings by calling on the getBooking function
    const bookings = await getBooking()

  try {
    // If the data is retrieved successfully, return a success response with the data
    return sendResponse({message: 'success', bookings})
  } catch (error) {
    // Or if an error occurs, return an error response
    console.error("Error retrieving bookings: ", error);
    return sendError(500, {
      message: "An error occurred while retrieving the bookings",
      error: error.toString(),
    });
  }
};

