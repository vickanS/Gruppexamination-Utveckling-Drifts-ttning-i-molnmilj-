const { db } = require("../../services/db.js");
const { sendError, sendResponse } = require("../../responses/index.js");

// Room prices
const ROOM_PRICES = {
  single: 500,
  double: 1000,
  suite: 1500,
};

// Function to calculate the total amount based on room type and stay duration
function calculateTotalAmount(roomType, checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const pricePerNight = ROOM_PRICES[roomType];
  return pricePerNight * nights;
}

// Function to update a booking
async function updateBooking(bookingNumber, updateDetails) {
  const { roomType, guests, checkIn, checkOut } = updateDetails;

  // Fetch existing booking from the database
  const existingBooking = await db.get({
    TableName: "Bonzai-booking",
    Key: { bookingNumber: bookingNumber },
  });

  // Check if the booking exists
  if (!existingBooking.Item) {
    return { error: "Booking not found" };
  }

  // Validate room type and guest count
  if (roomType === "single" && guests > 1) {
    return { error: "Single room cannot have more than 1 guest" };
  }
  if (roomType === "double" && guests > 2) {
    return { error: "Double room cannot have more than 2 guests" };
  }
  if (roomType === "suite" && guests > 3) {
    return { error: "Suite cannot have more than 3 guests" };
  }

  // Prepare update expression and attribute values for DynamoDB
  const updateExpression = [];
  const expressionAttributeValues = {};

  if (roomType) {
    updateExpression.push("roomType = :roomType");
    expressionAttributeValues[":roomType"] = roomType;
  }
  if (guests) {
    updateExpression.push("guests = :guests");
    expressionAttributeValues[":guests"] = guests;
  }
  if (checkIn) {
    updateExpression.push("checkIn = :checkIn");
    expressionAttributeValues[":checkIn"] = checkIn;
  }
  if (checkOut) {
    updateExpression.push("checkOut = :checkOut");
    expressionAttributeValues[":checkOut"] = checkOut;
  }

  // Recalculate total amount if check-in or check-out dates are updated
  if (checkIn || checkOut) {
    const newRoomType = roomType || existingBooking.Item.roomType;
    const newCheckIn = checkIn || existingBooking.Item.checkIn;
    const newCheckOut = checkOut || existingBooking.Item.checkOut;
    const totalAmount = calculateTotalAmount(newRoomType, newCheckIn, newCheckOut);
    updateExpression.push("totalAmount = :totalAmount");
    expressionAttributeValues[":totalAmount"] = totalAmount;
  }

  // Return error if no fields are provided for update
  if (updateExpression.length === 0) {
    return { error: "No fields to update" };
  }

  // Update the booking in the database
  await db.update({
    TableName: "Bonzai-booking",
    Key: { bookingNumber: bookingNumber },
    UpdateExpression: `set ${updateExpression.join(", ")}`,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  // Fetch the updated booking details
  const updatedBooking = await db.get({
    TableName: "Bonzai-booking",
    Key: { bookingNumber: bookingNumber },
  });

  // Return the updated booking details
  return {
    message: "Booking updated successfully",
    fullName: updatedBooking.Item.fullName,
    bookingNumber: updatedBooking.Item.bookingNumber,
    guests: updatedBooking.Item.guests,
    roomType: updatedBooking.Item.roomType,
    checkIn: updatedBooking.Item.checkIn,
    checkOut: updatedBooking.Item.checkOut,
    totalAmount: updatedBooking.Item.totalAmount,
  };
}

// Lambda function handler
exports.handler = async (event) => {
  console.log("Event received:", event.body);

  try {
    const { bookingNumber, ...updateDetails } = JSON.parse(event.body);

    if (!bookingNumber) {
      return sendError(400, "Missing bookingNumber");
    }

    const updateResult = await updateBooking(bookingNumber, updateDetails);

    if (updateResult.error) {
      return sendError(400, updateResult.error);
    }

    // Send success response with updated booking details
    return sendResponse(updateResult);
  } catch (error) {
    console.error("Error updating booking: ", error);
    return sendError(500, {
      message: "An error occurred while updating the booking",
      error: error.toString(),
    });
  }
};
