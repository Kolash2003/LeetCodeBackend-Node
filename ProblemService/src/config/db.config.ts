import mongoose from "mongoose";
import logger from "./logger.config";
import { serverConfig } from ".";

export const connectDB = async () => {
    try {
        const dbUrl = serverConfig.DB_URI;

        await mongoose.connect(dbUrl);

        logger.info("Connect to mongodb sucessfully");

        mongoose.connection.on("error", (error) => {
            logger.error("MongoDB connection error:", error);
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB connection error")
        });

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            logger.info("MongoDB connection closed");
            process.exit(0);
        })

    } catch (error) {
        logger.error("Failed to connect to mongoDB", error);
        process.exit(1);
    }
}