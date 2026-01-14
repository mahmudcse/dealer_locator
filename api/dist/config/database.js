import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        await mongoose.connect(mongoURI);
        // Extract database name from URI for display
        const dbName = mongoose.connection.db?.databaseName || "unknown";
        console.log(`MongoDB connected successfully to database: ${dbName}`);
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
export default connectDB;
//# sourceMappingURL=database.js.map