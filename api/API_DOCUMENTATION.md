# Dealer Locator API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Endpoints

### Health Check
- **GET** `/health`
  - Returns server and database status

### Dealers

#### Get All Dealers
- **GET** `/dealers`
  - Returns all dealers in the database

#### Get Dealer by ID
- **GET** `/dealers/:id`
  - Returns a specific dealer by ID

#### Create Dealer
- **POST** `/dealers`
  - Body:
    ```json
    {
      "name": "Dealer Name",
      "manufacturer": "KIA" | "Seat" | "Opel" | "Other",
      "address": {
        "street": "Street Address",
        "city": "City Name",
        "postalCode": "12345",
        "country": "Germany"
      },
      "location": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "contact": {
        "phone": "+49 123 456789",
        "email": "dealer@example.com",
        "website": "https://dealer.com"
      }
    }
    ```

#### Update Dealer
- **PUT** `/dealers/:id`
  - Updates a dealer by ID
  - Body: Same as create dealer

#### Delete Dealer
- **DELETE** `/dealers/:id`
  - Deletes a dealer by ID

### Search & Filter

#### Search by Postal Code
- **GET** `/dealers/search/postal-code?postalCode=12345`
  - Returns dealers matching the postal code

#### Search by Place Name
- **GET** `/dealers/search/place?place=Berlin`
  - Returns dealers in the specified city or matching postal code

#### Search by Radius
- **GET** `/dealers/search/radius?lat=52.52&lng=13.405&radius=10`
  - Returns dealers within the specified radius (in km) from coordinates
  - Parameters:
    - `lat`: Latitude (required)
    - `lng`: Longitude (required)
    - `radius`: Radius in kilometers (default: 10)

#### Filter by Manufacturer
- **GET** `/dealers/filter/manufacturer?manufacturer=KIA`
  - Returns dealers for the specified manufacturer
  - Valid values: `KIA`, `Seat`, `Opel`, `Other`

### Export

#### Export to CSV
- **GET** `/dealers/export/csv`
  - Downloads all dealers as CSV file
  - Optional query parameters for filtering:
    - `postalCode`: Filter by postal code
    - `place`: Filter by place name
    - `manufacturer`: Filter by manufacturer

#### Export to Excel
- **GET** `/dealers/export/excel`
  - Downloads all dealers as Excel file (.xlsx)
  - Optional query parameters for filtering (same as CSV)

## Example Usage

### Create a Dealer
```bash
curl -X POST http://localhost:3001/api/v1/dealers \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Search by Postal Code
```bash
curl "http://localhost:3001/api/v1/dealers/search/postal-code?postalCode=10115"
```

### Search by Radius
```bash
curl "http://localhost:3001/api/v1/dealers/search/radius?lat=52.52&lng=13.405&radius=5"
```

### Export to CSV
```bash
curl "http://localhost:3001/api/v1/dealers/export/csv" -o dealers.csv
```

### Export to Excel
```bash
curl "http://localhost:3001/api/v1/dealers/export/excel" -o dealers.xlsx
```

## Notes

- Coordinates format: `[longitude, latitude]` (GeoJSON format)
- All timestamps are automatically managed by Mongoose
- The database and collections are created automatically when first data is inserted
- Geospatial index is created for efficient radius searches
