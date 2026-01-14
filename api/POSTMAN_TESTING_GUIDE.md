# Postman Testing Guide for Dealer Locator API

## Base URL
```
http://localhost:3001/api/v1
```

Make sure your server is running:
```bash
cd api
npm run dev
```

---

## 1. Health Check

### GET Health Check
**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/health`
- Headers: None required

**Expected Response:**
```json
{
  "status": "OK",
  "database": {
    "status": "connected",
    "readyState": 1,
    "name": "your_database_name"
  },
  "server": {
    "port": 3001,
    "uptime": 123.45
  }
}
```

---

## 2. Create a Dealer (POST)

### Create KIA Dealer
**Request:**
- Method: `POST`
- URL: `http://localhost:3001/api/v1/dealers`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "KIA Berlin Center",
  "manufacturer": "KIA",
  "address": {
    "street": "Musterstraße 123",
    "city": "Berlin",
    "postalCode": "10115",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [13.4050, 52.5200]
  },
  "contact": {
    "phone": "+49 30 12345678",
    "email": "info@kiaberlin.de",
    "website": "https://kiaberlin.de"
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Dealer created successfully",
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "KIA Berlin Center",
    "manufacturer": "KIA",
    "address": {
      "street": "Musterstraße 123",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "Germany"
    },
    "location": {
      "type": "Point",
      "coordinates": [13.4050, 52.5200]
    },
    "contact": {
      "phone": "+49 30 12345678",
      "email": "info@kiaberlin.de",
      "website": "https://kiaberlin.de"
    },
    "createdAt": "2024-01-08T20:00:00.000Z",
    "updatedAt": "2024-01-08T20:00:00.000Z"
  }
}
```

### Create Seat Dealer
**Request:**
- Method: `POST`
- URL: `http://localhost:3001/api/v1/dealers`
- Body:
```json
{
  "name": "Seat München",
  "manufacturer": "Seat",
  "address": {
    "street": "Hauptstraße 45",
    "city": "München",
    "postalCode": "80331",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [11.5755, 48.1374]
  },
  "contact": {
    "phone": "+49 89 98765432",
    "email": "contact@seatmuenchen.de"
  }
}
```

### Create Opel Dealer
**Request:**
- Method: `POST`
- URL: `http://localhost:3001/api/v1/dealers`
- Body:
```json
{
  "name": "Opel Hamburg",
  "manufacturer": "Opel",
  "address": {
    "street": "Hafenstraße 78",
    "city": "Hamburg",
    "postalCode": "20095",
    "country": "Germany"
  },
  "location": {
    "type": "Point",
    "coordinates": [9.9937, 53.5511]
  },
  "contact": {
    "phone": "+49 40 11223344",
    "email": "info@opelhamburg.de",
    "website": "https://opelhamburg.de"
  }
}
```

---

## 3. Get All Dealers (GET)

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers`
- Headers: None required

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "name": "KIA Berlin Center",
      "manufacturer": "KIA",
      ...
    },
    ...
  ]
}
```

---

## 4. Search by Postal Code

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/search/postal-code?postalCode=10115`
- Headers: None required

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "KIA Berlin Center",
      "address": {
        "postalCode": "10115",
        ...
      },
      ...
    }
  ]
}
```

---

## 5. Search by Place Name (City)

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/search/place?place=Berlin`
- Headers: None required

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "KIA Berlin Center",
      "address": {
        "city": "Berlin",
        ...
      },
      ...
    }
  ]
}
```

---

## 6. Search by Radius (Geolocation)

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/search/radius?lat=52.52&lng=13.405&radius=50`
- Parameters:
  - `lat`: 52.52 (Berlin latitude)
  - `lng`: 13.405 (Berlin longitude)
  - `radius`: 50 (kilometers, optional, default: 10)

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "radius": 50,
  "center": {
    "lat": 52.52,
    "lng": 13.405
  },
  "data": [
    {
      "_id": "...",
      "name": "KIA Berlin Center",
      "location": {
        "coordinates": [13.4050, 52.5200]
      },
      ...
    }
  ]
}
```

---

## 7. Filter by Manufacturer

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/filter/manufacturer?manufacturer=KIA`
- Valid values: `KIA`, `Seat`, `Opel`, `Other`

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "manufacturer": "KIA",
  "data": [
    {
      "_id": "...",
      "name": "KIA Berlin Center",
      "manufacturer": "KIA",
      ...
    }
  ]
}
```

---

## 8. Get Dealer by ID

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/{dealer_id}`
- Replace `{dealer_id}` with actual ID from previous responses

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "KIA Berlin Center",
    ...
  }
}
```

---

## 9. Update Dealer (PUT)

**Request:**
- Method: `PUT`
- URL: `http://localhost:3001/api/v1/dealers/{dealer_id}`
- Headers:
  - `Content-Type: application/json`
- Body:
```json
{
  "name": "KIA Berlin Center - Updated",
  "contact": {
    "phone": "+49 30 99999999",
    "email": "newemail@kiaberlin.de"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "...",
    "name": "KIA Berlin Center - Updated",
    ...
  }
}
```

---

## 10. Delete Dealer (DELETE)

**Request:**
- Method: `DELETE`
- URL: `http://localhost:3001/api/v1/dealers/{dealer_id}`

**Expected Response:**
```json
{
  "success": true,
  "message": "Dealer deleted successfully"
}
```

---

## 11. Export to CSV

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/export/csv`
- Optional query parameters:
  - `postalCode=10115`
  - `place=Berlin`
  - `manufacturer=KIA`

**Expected Response:**
- Content-Type: `text/csv`
- File download: `dealers.csv`
- CSV format with headers: Name, Manufacturer, Street, City, Postal Code, Country, Phone, Email, Website, Latitude, Longitude

---

## 12. Export to Excel

**Request:**
- Method: `GET`
- URL: `http://localhost:3001/api/v1/dealers/export/excel`
- Optional query parameters (same as CSV):
  - `postalCode=10115`
  - `place=Berlin`
  - `manufacturer=KIA`

**Expected Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `dealers.xlsx`
- Excel file with formatted data

---

## Testing Workflow in Postman

### Step 1: Start the Server
```bash
cd api
npm run dev
```

### Step 2: Test Health Check
1. Create new GET request
2. URL: `http://localhost:3001/api/v1/health`
3. Send request
4. Verify database status is "connected"

### Step 3: Create Test Dealers
1. Create POST request for each manufacturer (KIA, Seat, Opel)
2. Use the example bodies above
3. Save the `_id` from responses for later use

### Step 4: Test Search Functionality
1. Search by postal code (e.g., `10115`)
2. Search by place name (e.g., `Berlin`)
3. Search by radius (use Berlin coordinates)
4. Filter by manufacturer (e.g., `KIA`)

### Step 5: Test Export
1. Export all dealers to CSV
2. Export filtered dealers to Excel
3. Verify downloaded files

### Step 6: Test CRUD Operations
1. Get dealer by ID
2. Update dealer
3. Delete dealer
4. Verify changes

---

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** Make sure server is running on port 3001

### Issue: "Database not connected"
**Solution:** Check your `.env` file has correct `MONGO_URI`

### Issue: "Validation error"
**Solution:** Ensure coordinates are `[longitude, latitude]` format (not lat, lng)

### Issue: "Dealer not found"
**Solution:** Use correct `_id` from MongoDB (24 character hex string)

---

## Postman Collection Setup Tips

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:3001/api/v1`
   - `dealer_id`: (set after creating a dealer)

2. **Use Variables in URLs:**
   - `{{base_url}}/dealers`
   - `{{base_url}}/dealers/{{dealer_id}}`

3. **Save Responses:**
   - Save dealer IDs from POST responses
   - Use them in subsequent GET/PUT/DELETE requests

4. **Test Scripts (Optional):**
   - Add tests to verify response status codes
   - Check response structure

---

## Example Postman Collection Structure

```
Dealer Locator API
├── Health Check
│   └── GET Health
├── Dealers
│   ├── POST Create KIA Dealer
│   ├── POST Create Seat Dealer
│   ├── POST Create Opel Dealer
│   ├── GET All Dealers
│   ├── GET Dealer by ID
│   ├── PUT Update Dealer
│   └── DELETE Dealer
├── Search
│   ├── GET Search by Postal Code
│   ├── GET Search by Place
│   ├── GET Search by Radius
│   └── GET Filter by Manufacturer
└── Export
    ├── GET Export CSV
    └── GET Export Excel
```
