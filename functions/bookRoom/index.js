const { db } = require("../../services/db.js");
const { v4: uuidv4 } = require("uuid");
const { sendError, sendResponse } = require("../../responses/index.js");

// A function that takes an object, converts all string values to lowercase.
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

// A function that creates a new booking item with a generated ID and input from the body.
async function createBooking(body) {
  // Input from body
  const { roomType, guests, checkIn, checkOut, fullName, email } = body;

  // Uniqe ID
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
  // Log the input body to cloudwatch
  console.log("Event received:", event.body);

  // Try to create a new item, handling error as needed
  try {
    let body = JSON.parse(event.body);

    // Converts all string fields to lowercase.
    body = bodyToLowerCase(body);

    // Check if all required fields are provided
    const { roomType, guests, checkIn, checkOut, fullName, email } = body;
    if (!roomType || !guests || !checkIn || !checkOut || !fullName || !email) {
      return sendError(400, {
        message:
          "Missing required fields: roomType, guests, date, fullName, and/or email",
      });
    }
    // Validate the number of guests based on room type
    if (roomType === "single" && guests > 1) {
      return sendError(400, "Single room cannot have more than 1 guest");
    }
    if (roomType === "double" && guests > 2) {
      return sendError(400, "Double room cannot have more than 2 guests");
    }
    if (roomType === "suite" && guests > 3) {
      return sendError(400, "Suite cannot have more than 3 guest");
    }

    // Create the booking and return success
    await createBooking(body);
    return sendResponse({ message: "Booking created successfully" });
  } catch (error) {
    // Log and return error if something goes wrong
    console.error("Error creating booking: ", error);
    return sendError(500, {
      message: "An error occurred while creating the booking",
      error: error.toString(),
    });
  }
};
