const { db } = require("../../services/db.js");
const { v4: uuidv4 } = require("uuid");
const { sendError, sendResponse } = require("../../responses/index.js");

function capitalizeName(name) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// A function that takes an object, converts all string values to lowercase.
function bodyToLowerCase(obj) {
  if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "string" && key !== "fullName") {
        obj[key] = obj[key].toLowerCase();
      } else if (typeof obj[key] === "object") {
        bodyToLowerCase(obj[key]);
      }
    });
  }
  return obj;
}

const ROOM_PRICES = {
  single: 500,
  double: 1000,
  suite: 1500,
};

function generateBookingNumber() {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// A function that creates a new booking item with a generated ID and input from the body.
async function createBooking(body) {
  // Input from body
  const { roomType, guests, checkIn, checkOut, fullName, email } = body;

  // Uniqe ID
  const id = uuidv4();
  const bookingId = uuidv4();
  const bookingNumber = generateBookingNumber();

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  const pricePerNight = ROOM_PRICES[roomType];
  const totalAmount = pricePerNight * nights;

  const booking = {
    bookingId: bookingId,
    bookingNumber: bookingNumber,
    roomType: roomType,
    guests: guests,
    checkIn: checkIn,
    checkOut: checkOut,
    fullName: capitalizeName(fullName),
    email: email,
    totalAmount: totalAmount,
  };

  await db.put({
    TableName: "Bonzai-booking",
    Item: booking,
  });

  return booking;
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
          "Missing required fields: roomType, guests, checkIn, checkOut, fullName, and/or email",
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
      return sendError(400, "Suite cannot have more than 3 guests");
    }

    const booking = await createBooking(body);
    return sendResponse({
      message: "Booking created successfully",
      fullName: booking.fullName,
      bookingNumber: booking.bookingNumber,
      guests: booking.guests,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount,
    });
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
