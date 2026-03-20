# MongoDB Setup Guide for Petrol Bunk Manager

## Backend Folder Structure
```
backend/
├── server.js                 # Express server
├── package.json             # Dependencies
├── .env                     # Environment variables
├── models/
│   ├── PumpEntry.js        # Pump entry schema
│   └── Payment.js          # Payment schema
└── routes/
    ├── pumpEntries.js      # Pump entries API routes
    └── payments.js         # Payments API routes
```

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup MongoDB Atlas (Free Account)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" and create a free account
3. Create a new cluster (free tier available)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add Database User"
   - Set username and password
5. Get connection string:
   - Click "Connect"
   - Select "Drivers"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`

### 3. Update .env File
In `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/petrol-bunk?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

Replace:
- `username` - your database user
- `password` - your database password
- `your-cluster` - your cluster name (from connection string)

### 4. Start the Backend Server
```bash
npm run dev
# or
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Pump Entries Endpoints

#### Create Entry
- **POST** `/pump-entries`
```json
{
  "nozzleNumber": 1,
  "openingReading": 1000,
  "fuelType": "Petrol",
  "pricePerLiter": 100
}
```

#### Get All Entries
- **GET** `/pump-entries`

#### Get Entry by ID
- **GET** `/pump-entries/:id`

#### Get Entries by Nozzle
- **GET** `/pump-entries/nozzle/:nozzleNumber`

#### Get Entries by Date Range
- **GET** `/pump-entries/date-range/:startDate/:endDate`
- Example: `/pump-entries/date-range/2026-03-01/2026-03-20`

#### Update Entry
- **PUT** `/pump-entries/:id`
```json
{
  "closingReading": 1100,
  "quantitySold": 100,
  "status": "closed"
}
```

#### Delete Entry
- **DELETE** `/pump-entries/:id`

### Payments Endpoints

#### Create Payment
- **POST** `/payments`
```json
{
  "customerName": "John Doe",
  "amount": 10000,
  "paymentMethod": "Cash",
  "fuelType": "Petrol",
  "quantityLiters": 100,
  "transactionId": "TXN123",
  "notes": "Regular customer",
  "pumpEntryId": "optional_entry_id"
}
```

#### Get All Payments
- **GET** `/payments`

#### Get Payment by ID
- **GET** `/payments/:id`

#### Get Payments by Customer
- **GET** `/payments/customer/:customerName`

#### Get Payment Statistics
- **GET** `/payments/stats/date-range/:startDate/:endDate`
- Example: `/payments/stats/date-range/2026-03-01/2026-03-20`

#### Update Payment
- **PUT** `/payments/:id`
```json
{
  "status": "completed",
  "transactionId": "NEW_TXN123",
  "notes": "Updated notes"
}
```

#### Delete Payment
- **DELETE** `/payments/:id`

## Connect Frontend to Backend

Add this to your frontend `package.json` to communicate with backend:

```json
"proxy": "http://localhost:5000"
```

Or use fetch with full URL:
```javascript
const response = await fetch('http://localhost:5000/api/pump-entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Health Check
- **GET** `/api/health` - Check if backend is running

## Testing Backend

Use these curl commands or Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Create pump entry
curl -X POST http://localhost:5000/api/pump-entries \
  -H "Content-Type: application/json" \
  -d '{"nozzleNumber":1,"openingReading":1000,"fuelType":"Petrol","pricePerLiter":100}'

# Get all entries
curl http://localhost:5000/api/pump-entries

# Create payment
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John","amount":10000,"paymentMethod":"Cash","fuelType":"Petrol","quantityLiters":100}'
```

## Troubleshooting

### MongoDB Connection Fails
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Verify username/password in connection string
- Ensure `.env` file has correct MONGODB_URI

### CORS Errors
- Already configured in `server.js`
- Make sure backend is running before frontend

### Port Already in Use
- Change PORT in `.env` if 5000 is busy
- Or kill process using port: `lsof -i :5000`
