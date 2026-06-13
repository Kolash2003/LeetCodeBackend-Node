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


        // The SIGINT is triggered when we manually try to close the server
        process.on("SIGINT", async () => {    // This is when we want to handle the connection removal more gracefully
            await mongoose.connection.close();
            logger.info("MongoDB connection closed");
            process.exit(0);   // this is a success status in linux
            // Non zero value id faliure
        })

    } catch (error) {
        logger.error("Failed to connect to mongoDB", error);
        process.exit(1);  // Exit with failure
    }
}