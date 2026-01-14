# Quick Start Guide

## The Problem
You're seeing `ECONNREFUSED` errors because the **backend API server is not running**.

## Solution: Start the Backend Server

You need **TWO terminals** running:

### Terminal 1 - Backend API
```bash
cd dealer/api
npm run dev
```

You should see:
```
Server is running on port 3001
MongoDB connected successfully to database: your_database_name
```

### Terminal 2 - Frontend
```bash
cd dealer/frontend
npm run dev
```

You should see:
```
VITE v6.4.1  ready in XXX ms
➜  Local:   http://localhost:3000/
```

## Alternative: Use the Start Script

I've created a script to start both servers:

```bash
cd dealer
./start-dev.sh
```

This will start both servers in the background. Press `Ctrl+C` to stop both.

## Verify It's Working

1. Backend should show: `Server is running on port 3001`
2. Frontend should show: `Local: http://localhost:3000/`
3. No more `ECONNREFUSED` errors in the frontend terminal
4. Open `http://localhost:3000` in your browser

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use: `lsof -ti:3001`
- Make sure MongoDB is running (if using local MongoDB)
- Check your `.env` file has correct `MONGO_URI`

### Still getting connection errors
- Make sure backend is actually running (check Terminal 1)
- Verify backend shows "Server is running on port 3001"
- Try accessing `http://localhost:3001/api/v1/health` directly in browser
