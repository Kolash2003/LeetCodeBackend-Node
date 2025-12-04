import { Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";

async function setUpEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async (job) => {
        logger.info(`processing job ${job}`);
    }, {
        connection: createNewRedisConnection(),
    });

    worker.on("error", (error) => {
        logger.error(`Evaluation worker error: ${error}`);
    });

    worker.on("completed", (job) => {
        logger.info(`Evaluation job completed ${job}`);
    });

    worker.on("failed", (job, error) => {
        logger.error(`Evaluation job failed: ${job}`, error);
    });
}

export async function startWorkers() {
    await setUpEvaluationWorker();
}


