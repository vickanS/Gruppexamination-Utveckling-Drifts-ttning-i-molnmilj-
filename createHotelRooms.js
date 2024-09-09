const { db } = require("services/db.js");

// 20 hotelrooms
const hotelrooms = [
  {
    roomId: "room-1",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: true,
  },
  {
    roomId: "room-2",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: false,
  },
  {
    roomId: "room-3",
    roomType: "Svit",
    maxGuests: 3,
    pricePerNight: 1500,
    available: true,
  },
  {
    roomId: "room-4",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: false,
  },
  {
    roomId: "room-5",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: true,
  },
  {
    roomId: "room-6",
    roomType: "Svit",
    maxGuests: 3,
    pricePerNight: 1500,
    available: false,
  },
  {
    roomId: "room-7",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: true,
  },
  {
    roomId: "room-8",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: false,
  },
  {
    roomId: "room-9",
    roomType: "Svit",
    maxGuests: 3,
    pricePerNight: 1500,
    available: true,
  },
  {
    roomId: "room-10",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: false,
  },
  {
    roomId: "room-11",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: true,
  },
  {
    roomId: "room-12",
    roomType: "Svit",
    maxGuests: 3,
    pricePerNight: 1500,
    available: false,
  },
  {
    roomId: "room-13",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: true,
  },
  {
    roomId: "room-14",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: false,
  },
  {
    roomId: "room-15",
    roomType: "Svit",
    maxGuests: 3,
    pricePerNight: 1500,
    available: true,
  },
  {
    roomId: "room-16",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: true,
  },
  {
    roomId: "room-17",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: false,
  },
  {
    roomId: "room-18",
    roomType: "Svit",
    maxGuests: 3,
    pricePerNight: 1500,
    available: true,
  },
  {
    roomId: "room-19",
    roomType: "Enkelrum",
    maxGuests: 1,
    pricePerNight: 500,
    available: false,
  },
  {
    roomId: "room-20",
    roomType: "Dubbelrum",
    maxGuests: 2,
    pricePerNight: 1000,
    available: true,
  },
];

// Creates hotelrooms and upload to DynamoDB
async function createRooms() {
  for (const room of hotelrooms) {
    const params = {
      TableName: "Bonzai-rooms",
      Item: {
        roomId: room.roomId,
        roomType: room.roomType,
        maxGuests: room.maxGuests,
        pricePerNight: room.pricePerNight,
        available: room.available,
      },
    };

    try {
      //Try to upload the rooms, if fail, catch it.
      await db.put(params);
      console.log(`Successfully added ${room.roomId}`);
    } catch (error) {
      console.error(`Failed to add ${room.roomId}:`, error);
    }
  }
}

exports.handler = async (event) => {
  try {
    await createRooms();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "All rooms have been added successfully",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error adding rooms",
        error: error.message,
      }),
    };
  }
};
