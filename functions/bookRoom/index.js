const { db } = require("../../services/db.js");
const { v4: uuidv4 } = require("uuid");
const { sendError, sendResponse } = require("../../responses/index.js");

function bodyToLowerCase(obj) {
  if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].toLowerCase();
      } else if (typeof obj[key] === "object") {
        bodyToLowerCase(obj[key]);
      }
    });
  }
  return obj;
}

async function createBooking(body) {
  const { roomType, guests, checkIn, checkOut, fullName, email } = body;
  const id = uuidv4();

  await db.put({
    TableName: "Bonzai-booking",
    Item: {
      bookingId: id,
      roomType: roomType,
      guests: guests,
      checkIn: checkIn,
      checkOut: checkOut,
      fullName: fullName,
      email: email,
    },
  });
}

exports.handler = async (event) => {
  console.log("Event received:", event.body);
  try {
    let body = JSON.parse(event.body);
    body = bodyToLowerCase(body);
    const { roomType, guests, checkIn, checkOut, fullName, email } = body;
    if (!roomType || !guests || !checkIn || !checkOut || !fullName || !email) {
      return sendError(400, {
        message:
          "Missing required fields: roomType, guests, date, fullName, and/or email",
      });
    }
    if (roomType === "single" && guests > 1) {
      return sendError(400, "Single room cannot have more than 1 guest");
    }
    if (roomType === "double" && guests > 2) {
      return sendError(400, "Double room cannot have more than 2 guests");
    }
    if (roomType === "suite" && guests > 3) {
      return sendError(400, "Suite cannot have more than 3 guest");
    }

    await createBooking(body);
    return sendResponse({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Error creating booking: ", error);
    return sendError(500, {
      message: "An error occurred while creating the booking",
      error: error.toString(),
    });
  }
};
