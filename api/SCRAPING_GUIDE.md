# Dealer Scraping Implementation Guide

## Overview

This implementation provides live scraping functionality from three manufacturer websites:
- **KIA**: https://www.kia.com/de/haendlersuche/#/
- **Seat**: https://www.seat.de/kontakt/haendlersuche
- **Opel**: https://www.opel.de/tools/haendlersuche.html

## How It Works

The scraping system uses **Playwright** for browser automation to:
1. Navigate to manufacturer dealer search pages
2. Enter postal code in search field
3. Extract dealer information (name, address, contact details)
4. Geocode addresses to get coordinates
5. Save dealers to MongoDB database

## API Endpoints

### Preview Scraping (Doesn't Save)
```
GET /api/v1/dealers/scrape/preview?postalCode=10115&manufacturer=KIA
```

**Parameters:**
- `postalCode` (required): German postal code (e.g., "10115")
- `manufacturer` (optional): "KIA", "Seat", "Opel", or "All" (default: "All")

**Response:**
```json
{
  "success": true,
  "message": "Found 10 dealers",
  "count": 10,
  "data": [...]
}
```

### Scrape and Save
```
GET /api/v1/dealers/scrape?postalCode=10115&manufacturer=KIA
```

**Parameters:** Same as preview

**Response:**
```json
{
  "success": true,
  "message": "Scraped 10 dealers, saved 8 new dealers",
  "scraped": 10,
  "saved": 8,
  "data": [...]
}
```

## Frontend Usage

1. Enter a postal code in the search field
2. Select manufacturer from dropdown (All, KIA, Seat, or Opel)
3. Click "Scrape Dealers" button
4. Dealers will be scraped, geocoded, and saved to database
5. Results will appear in the dealer list

## Technical Details

### Dependencies
- **Playwright**: Browser automation for JavaScript-heavy websites
- **Cheerio**: HTML parsing (backup method)
- **Axios**: HTTP requests
- **Nominatim (OpenStreetMap)**: Geocoding service

### Scraping Process

1. **Launch Browser**: Playwright launches headless Chromium
2. **Navigate**: Goes to manufacturer dealer search page
3. **Search**: Enters postal code and triggers search
4. **Extract**: Parses dealer information from page
5. **Geocode**: Converts addresses to coordinates
6. **Save**: Stores dealers in MongoDB (if save option is used)

### Error Handling

- If scraping fails for one manufacturer, others will still be attempted
- Errors are logged but don't stop the entire process
- Frontend shows error messages to users

## Limitations

1. **Website Changes**: If manufacturer websites change their structure, scraping may break
2. **Rate Limiting**: Some websites may rate-limit requests
3. **JavaScript**: Requires browser automation (Playwright) for JavaScript-rendered content
4. **Geocoding**: Uses free Nominatim service (rate limits apply)

## Testing

### Using Postman

```bash
# Preview scraping (doesn't save)
GET http://localhost:3001/api/v1/dealers/scrape/preview?postalCode=10115&manufacturer=KIA

# Scrape and save
GET http://localhost:3001/api/v1/dealers/scrape?postalCode=10115&manufacturer=All
```

### Using Frontend

1. Start backend: `cd api && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000
4. Enter postal code (e.g., "10115" for Berlin)
5. Select manufacturer
6. Click "Scrape Dealers"

## Troubleshooting

### Playwright Browser Not Found
```bash
cd api
npx playwright install chromium
```

### Scraping Returns Empty Results
- Check if manufacturer website structure has changed
- Verify postal code format (5 digits for Germany)
- Check browser console for errors
- Some sites may require longer wait times

### Geocoding Fails
- Nominatim has rate limits (1 request per second)
- Check internet connection
- Verify address format is correct

## Future Improvements

1. **Caching**: Cache scraped results to avoid repeated requests
2. **Scheduling**: Periodic scraping to keep data updated
3. **Multiple Geocoding Services**: Fallback options if Nominatim fails
4. **Better Error Messages**: More specific error handling
5. **Progress Indicators**: Show scraping progress for multiple manufacturers
