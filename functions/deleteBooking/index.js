const { db } = require("../../services/db");
const { sendResponse, sendError } = require("../../responses/index");

// Remove the reservation from database
async function deleteReservation(bookingId) {
  await db.delete({
    TableName: "Bonzai-booking",
    Key: {
      bookingId: bookingId,
    },
  });
}

// Get the reservation
async function getReservation(bookingId) {
  const { Item } = await db.get({
    TableName: "Bonzai-booking",
    Key: {
      bookingId: bookingId,
    },
  });

  return Item;
}

exports.handler = async (event) => {
  // Get bookingId from path
  const bookingId = event.pathParameters.id;

  const reservationInfo = await getReservation(bookingId);

  // See if reservation exists.
  if (!reservationInfo) {
    return sendError(400, {
      message: "Can't find the reservation",
    });
  }
  // Delete reservation or return error
  try {
    await deleteReservation(bookingId);
    return sendResponse(200, { message: "Reservation is removed" });
  } catch (error) {
    return sendError(404, {
      message: "Can't delete reservation",
      error: error.toString(),
    });
  }
};
