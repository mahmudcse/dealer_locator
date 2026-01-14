import express, { Request, Response } from "express";
import mongoose from "mongoose";
import router from "./app/routes/index.js";
import Test from "./models/Test.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API base route info (similar to On-Book-Server's root message)
app.get("/api/v1", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Dealer Locator API",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      dealers: "/api/v1/dealers",
      test: "/api/v1/test",
    },
  });
});

// Mount versioned API router
app.use("/api/v1", router);

// Database health check route
app.get("/api/v1/health", (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  } as const;

  res.json({
    status: "OK",
    database: {
      status: dbStates[dbStatus as keyof typeof dbStates] || "unknown",
      readyState: dbStatus,
      name: mongoose.connection.db?.databaseName || "unknown",
    },
    server: {
      uptime: process.uptime(),
    },
  });
});

// Test routes (kept as simple demo module)
app.post("/api/v1/test", async (req: Request, res: Response) => {
  try {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        error: "Name and message are required",
      });
    }

    const testDoc = new Test({
      name,
      message,
    });

    const savedDoc = await testDoc.save();

    return res.status(201).json({
      success: true,
      message: "Test document created successfully",
      data: savedDoc,
    });
  } catch (error) {
    console.error("Error creating test document:", error);
    return res.status(500).json({
      error: "Failed to create test document",
    });
  }
});

app.get("/api/v1/test", async (_req: Request, res: Response) => {
  try {
    const tests = await Test.find();
    return res.json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    console.error("Error fetching test documents:", error);
    return res.status(500).json({
      error: "Failed to fetch test documents",
    });
  }
});

export default app;

