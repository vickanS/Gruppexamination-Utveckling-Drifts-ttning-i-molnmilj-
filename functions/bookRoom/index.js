const { db } = require("../../services/db.js");
const { v4: uuidv4 } = require("uuid");
const { sendError, sendResponse } = require("../../responses/index.js");

// Capitalizes the first letter of each name and converts the rest of the letters to lowercase
function capitalizeName(name) {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// Capitalize roomType
function capitalizeRoomType(roomType) {
  if (typeof roomType === "string") {
    return roomType.charAt(0).toUpperCase() + roomType.slice(1).toLowerCase();
  }
  return roomType;
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

// Room prices
const ROOM_PRICES = {
  Single: 500,
  Double: 1000,
  Suite: 1500,
};

// Generates a random booking number
function generateBookingNumber() {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//  Returns an object with available rooms
async function roomsAvailable(roomType) {
  const roomAvailable = await db.scan({
    TableName: "Bonzai-rooms",
  });

  // Filter out rooms based on availability and room type
  const filteredRooms = roomAvailable.Items.filter(
    (item) => item.available === true && item.roomType === roomType
  ).map((item) => ({
    roomId: item.roomId,
    available: item.available,
    roomType: item.roomType,
  }));

  return { Items: filteredRooms };
}

// Get the first available room
async function getFirstAvailableRoom(roomType) {
  const availableRoom = await roomsAvailable(roomType);

  if (!availableRoom.Items || availableRoom.Items.length === 0) {
    throw new Error("No rooms available");
  }

  return availableRoom.Items[0];
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

  const updateRoom = await db.update(params);
  return updateRoom.Attributes;
}

// A function that creates a new booking item with a generated ID and input from the body.
async function createBooking(body, roomId) {
  // Input from body
  const { roomType, guests, checkIn, checkOut, fullName, email } = body;

  // Uniqe ID
  const bookingId = uuidv4();
  const bookingNumber = generateBookingNumber().toString();

  // Calculate the total price
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
    roomId: roomId,
  };

  await db.put({
    TableName: "Bonzai-booking",
    Item: booking,
  });

  return booking;
}

// Processes a reservation request by validating input data, checking room availability, and booking a room if all criteria are met.
async function procesReservation(reservation) {
  // Converts all string fields to lowercase.
  reservation = bodyToLowerCase(reservation);
  reservation.roomType = capitalizeRoomType(reservation.roomType);

  // Check if all required fields are provided
  const { roomType, guests, checkIn, checkOut, fullName, email } = reservation;

  if (!roomType || !guests || !checkIn || !checkOut || !fullName || !email) {
    return sendError(
      400,
      "Missing required fields: roomType, guests, checkIn, checkOut, fullName, and/or email"
    );
  }

  // Validate the number of guests based on room type
  if (roomType === "Single" && guests > 1) {
    return sendError(400, "Single room cannot have more than 1 guest");
  }
  if (roomType === "Double" && guests > 2) {
    return sendError(400, "Double room cannot have more than 2 guests");
  }
  if (roomType === "Suite" && guests > 3) {
    return sendError(400, "Suite cannot have more than 3 guests");
  }

  // Run the roomsAvailable function and see if there is any rooms available
  const availableRoom = await roomsAvailable(roomType);
  if (!availableRoom.Items || availableRoom.Items.length === 0) {
    return sendError(400, "Sorry, no " + roomType + " rooms available.");
  }

  const roomToBook = await getFirstAvailableRoom(roomType);

  // Check if `roomToBook` and `roomId` exist
  if (!roomToBook || !roomToBook.roomId) {
    return sendError(500, "Failed to find a valid room to book.");
  }

  const roomId = roomToBook.roomId;

  // Update status to false
  await updateRoomStatus(roomId, false);

  // Create the booking and return success
  const booking = await createBooking(reservation, roomId);
  return booking;
}

exports.handler = async (event) => {
  // Try to create a new item, handling error as needed
  try {
    let body = JSON.parse(event.body);

    if (Array.isArray(body)) {
      const bookings = [];
      for (let reservation of body) {
        const booking = await procesReservation(reservation);
        bookings.push(booking);
      }

      return sendResponse({
        message: "Booking created successfully",
        bookings: bookings,
      });
    } else if (typeof body === "object" && body !== null) {
      const booking = await procesReservation(body);
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
    } else {
      return sendError(
        400,
        "Request body must be an object or an array of objects"
      );
    }
  } catch (error) {
    // Log and return error if something goes wrong
    console.error("Error creating booking: ", error);
    return sendError(500, {
      message: "An error occurred while creating the booking",
      error: error.toString(),
    });
  }
};
