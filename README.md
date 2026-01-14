# Dealer Locator - Full Stack Application

A full-stack dealer locator application with Vue.js frontend and Express.js/TypeScript backend.

## Project Structure

```
dealer/
├── api/          # Backend API (Express + TypeScript + MongoDB)
└── frontend/     # Frontend (Vue 3 + TypeScript)
```

## Quick Start

### 0. Prerequisites

- **Node.js**: v18+ recommended  
- **npm**: 9+  
- **MongoDB**: local instance or a MongoDB Atlas connection string

### 1. Backend Setup (API)

```bash
cd api
npm install
```

Create a `.env` file in the `api` directory:
```
PORT=3001
MONGO_URI=your_mongodb_connection_string
```

Start the backend:
```bash
npm run dev
```

Backend will run on: `http://localhost:3001`

### 2. Frontend Setup (Vue 3)

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Running Both Servers

### Option 1: Separate Terminals

**Terminal 1 (Backend):**
```bash
cd api
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Using npm-run-all (if installed)

```bash
# Install concurrently globally
npm install -g concurrently

# Run both from root
concurrently "cd api && npm run dev" "cd frontend && npm run dev"
```

## API Endpoints

- Health Check: `GET http://localhost:3001/api/v1/health`
- Get All Dealers: `GET http://localhost:3001/api/v1/dealers`
- Search by Postal Code: `GET http://localhost:3001/api/v1/dealers/search/postal-code?postalCode=10115`
- Search by Place: `GET http://localhost:3001/api/v1/dealers/search/place?place=Berlin`
- Filter by Manufacturer: `GET http://localhost:3001/api/v1/dealers/filter/manufacturer?manufacturer=KIA`
- Export CSV: `GET http://localhost:3001/api/v1/dealers/export/csv`
- Export Excel: `GET http://localhost:3001/api/v1/dealers/export/excel`

## Features

### Backend
- Express.js with TypeScript
- MongoDB with Mongoose
- RESTful API
- Search by postal code, place name, radius
- Filter by manufacturer
- CSV/Excel export

### Frontend
- Vue 3 with Composition API
- TypeScript
- Pinia for state management
- Vue Router
- Responsive design
- Search and filter functionality
- Export to CSV/Excel

## Testing

### Backend API Testing
See `api/POSTMAN_TESTING_GUIDE.md` for detailed Postman testing instructions.

### Frontend Testing
1. Open `http://localhost:3000`
2. Search for dealers by postal code or place name
3. Filter by manufacturer
4. Export results

## Development

### Backend
- Development: `npm run dev` (uses tsx with hot reload)
- Build: `npm run build`
- Production: `npm start`

### Frontend
- Development: `npm run dev` (Vite dev server)
- Build: `npm run build`
- Preview: `npm run preview`

## Environment Variables

### Backend (.env in `api/`)
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/dealerlocator
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

The frontend is already configured (via Vite dev proxy) to talk to `http://localhost:3001/api/v1`.

## Troubleshooting

### Backend not connecting to MongoDB
- Ensure MongoDB is running (if using local MongoDB)
- Check your `.env` file has correct `MONGO_URI`
- For Atlas, verify that your IP is whitelisted and the connection string is correct

### Frontend not connecting to API
- Ensure backend is running on port 3001
- Check browser console and terminal for CORS or network errors
- Verify Vite proxy configuration in `frontend/vite.config.ts` if you change ports

### Port already in use
- Change port in backend `.env` file (e.g. `PORT=3002`)
- Update Vite proxy target in `frontend/vite.config.ts` to match

