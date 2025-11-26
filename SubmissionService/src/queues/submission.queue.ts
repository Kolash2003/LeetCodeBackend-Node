import { Queue } from "bullmq";
import { createNewRedisConnection } from "../config/redis.config";
import logger from "../config/logger.config";

export const submissionQueue = new Queue("submissionQueue", {
    connection: createNewRedisConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000 // 2 seconds
        }
    }
});

submissionQueue.on("error", (error) => {
    console.error(`Submission Queue Error: ${error}`);
});

submissionQueue.on("waiting", (job) => {
    logger.info(`Job ${job.id} is waiting to be processed`);
});




