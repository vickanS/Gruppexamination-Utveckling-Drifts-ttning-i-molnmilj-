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

// Update availability
async function updateRoomStatus(roomId, availableStatus) {
  const params = {
    TableName: "Bonzai-rooms",
    Key: { roomId: roomId },
    UpdateExpression: "set available = :available",
    ExpressionAttributeValues: {
      ":available": availableStatus,
    },
    ReturnValues: "ALL_NEW",
  };

  const updateRoom = db.update(params);
  return updateRoom.Attributes;
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

  // Find room id
  const roomId = reservationInfo.roomId;

  try {
    // Update status to false
    await updateRoomStatus(roomId, true);

    // Delete reservation
    await deleteReservation(bookingNumber);
    return sendResponse("Reservation is removed");
  } catch (error) {
    return sendError(404, "Can't delete reservation");
  }
};
