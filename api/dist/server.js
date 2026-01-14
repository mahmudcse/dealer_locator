import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import Test from "./models/Test.js";
import dealerRoutes from "./routes/dealerRoutes.js";
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.get("/api/v1", (_req, res) => {
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
// Dealer routes
app.use("/api/v1/dealers", dealerRoutes);
// Database health check route
app.get("/api/v1/health", (_req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };
    res.json({
        status: "OK",
        database: {
            status: dbStates[dbStatus] || "unknown",
            readyState: dbStatus,
            name: mongoose.connection.db?.databaseName || "unknown",
        },
        server: {
            port: PORT,
            uptime: process.uptime(),
        },
    });
});
// Create a test document (this will create the database and collection)
app.post("/api/v1/test", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error creating test document:", error);
        return res.status(500).json({
            error: "Failed to create test document",
        });
    }
});
// Get all test documents
app.get("/api/v1/test", async (_req, res) => {
    try {
        const tests = await Test.find();
        return res.json({
            success: true,
            count: tests.length,
            data: tests,
        });
    }
    catch (error) {
        console.error("Error fetching test documents:", error);
        return res.status(500).json({
            error: "Failed to fetch test documents",
        });
    }
});
// Start server
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
});
//# sourceMappingURL=server.js.map