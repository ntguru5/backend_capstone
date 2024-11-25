# Pet Care API

A RESTful API for managing pet care activities including pet profiles, bathroom logs, and feeding schedules.

## Features

- 🐕 Pet Profile Management
- 🚽 Bathroom Activity Tracking
- 🍽️ Feeding Schedule Management
- 📊 Activity Statistics
- 🔒 Data Validation
- 📝 Detailed Logging

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Axios for HTTP requests

## Prerequisites

- Node.js
- MongoDB
- npm

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pet-care-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Dogs

- `GET /api/dogs` - Get all dogs
- `GET /api/dogs/:id` - Get a specific dog
- `POST /api/dogs` - Create a new dog
- `PATCH /api/dogs/:id` - Update a dog
- `DELETE /api/dogs/:id` - Delete a dog

### Bathroom Logs

- `GET /api/bathroom-logs` - Get all bathroom logs
- `GET /api/bathroom-logs/stats` - Get bathroom statistics
- `POST /api/bathroom-logs` - Create a new bathroom log
- `PATCH /api/bathroom-logs/:id` - Update a bathroom log
- `DELETE /api/bathroom-logs/:id` - Delete a bathroom log

### Feeding Logs

- `GET /api/feeding` - Get all feeding logs
- `POST /api/feeding` - Create a new feeding log
- `PATCH /api/feeding/:id` - Update a feeding log
- `DELETE /api/feeding/:id` - Delete a feeding log

## API Examples

### Create a Dog Profile

```bash
curl -X POST http://localhost:3000/api/dogs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "breed": "Golden Retriever",
    "age": 3,
    "weight": 30,
    "gender": "male",
    "ownerName": "John Smith"
  }'
```

### Add a Bathroom Log

```bash
curl -X POST http://localhost:3000/api/bathroom-logs \
  -H "Content-Type: application/json" \
  -d '{
    "dogId": "dog_id_here",
    "type": "poop",
    "consistency": "normal",
    "color": "brown",
    "notes": "Morning walk"
  }'
```

### Add a Feeding Log

```bash
curl -X POST http://localhost:3000/api/feeding \
  -H "Content-Type: application/json" \
  -d '{
    "dogId": "dog_id_here",
    "foodType": "dry",
    "amount": 1,
    "calories": 300,
    "mealTime": "breakfast",
    "brand": "Royal Canin"
  }'
```

## Data Models

### Dog Schema
```javascript
{
  name: String,
  breed: String,
  age: Number,
  weight: Number,
  gender: String,
  ownerName: String,
  imageUrl: String
}
```

### Bathroom Log Schema
```javascript
{
  dogId: ObjectId,
  type: String,
  date: Date,
  consistency: String,
  color: String,
  notes: String
}
```

### Feeding Log Schema
```javascript
{
  dogId: ObjectId,
  foodType: String,
  amount: Number,
  date: Date,
  mealTime: String,
  brand: String
  notes: String,
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

Errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

## Development

Run in development mode with nodemon:
```bash
npm run dev
```
