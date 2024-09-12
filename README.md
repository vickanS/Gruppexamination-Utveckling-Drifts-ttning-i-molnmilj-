# Group Examination: Bonz.ai
### Created by Eric, Winnie, and Victoria

## Steps to run the project:
1. Clone the Git repository:
- Open your terminal/console and run the following command: git clone <repo-url>

2. Navigate to the project directory:
- Run the command: cd <directory-name>

3. Install dependencies:
 Use the command: npm install
This will install all the required dependencies.

4. Deploy the code to AWS:
- Run the following command to deploy the project: serverless deploy

This will create several Lambda functions and two databases in your AWS account.

## Retrieve URLs:
Once deployed, you’ll see some URLs in your terminal/console.
Use these in a tool like Insomnia or any other program that can execute API requests.

### How to use the API:
Create hotel rooms in the database:
Execute the URL with the path /createRooms using the PUT method.
This will add 20 hotel rooms to the database.

### Make a reservation:
Execute the URL with the path /booking using the POST method.
Here's an example of a JSON object to use in the request body:
```
{
  "roomType": "single",
  "guests": 1,
  "checkIn": "2024-09-10",
  "checkOut": "2024-09-14",
  "fullName": "Test Testsson",
  "email": "test.testsson@example.com"
}
```
You can choose from different room types: Single, Double, or Suite.

### Cancel a reservation:
Execute the URL with the path /cancel/{id} using the DELETE method.
Replace {id} with the booking number you received during the reservation process, for example: "bookingNumber": "8710805234"

### View reservations as a receptionist:
Use the URL with the path /bookings and the GET method to retrieve all current reservations.

### Update a booking:
Use the URL with the path /updateBooking and the PUT method.
Modify the JSON object to update specific details of the reservation. Here's an example:
```
{
  "roomType": "single",
  "guests": 1,
  "checkIn": "2024-09-10",
  "checkOut": "2024-09-14",
  "fullName": "Test Testsson",
  "email": "test.testsson@example.com"
}
```

### View all rooms and their status:
Use the URL with the path /rooms and the GET method to check the status of each room.
