const { db } = require("../../services/db");
const { sendResponse, sendError } = require("../../responses/index");

// Remove the reservation from database
async function deleteReservation(bookingNumber) {
  await db.delete({
    TableName: "Bonzai-booking",
    Key: {
      bookingNumber: bookingNumber,
    },
  });
}

// Get the reservation
async function getReservation(bookingNumber) {
  const { Item } = await db.get({
    TableName: "Bonzai-booking",
    Key: {
      bookingNumber,
    },
  });

  return Item;
}

exports.handler = async (event) => {
  // Get bookingNumber from path
  const bookingNumber = event.pathParameters.id;

  let reservationInfo = await getReservation(bookingNumber);
  
  // See if reservation exists.
  if (!reservationInfo) {
    return sendError(500, "Can't find the reservation");
  }
  // Delete reservation or return error
  try {
    await deleteReservation(bookingNumber);
    return sendResponse("Reservation is removed");
  } catch (error) {
    return sendError(404, "Can't delete reservation");
  }
};
