import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { EvaluationJob } from "../interfaces/evaluation.interface";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { runCode } from "../utils/containers/codeRunner.util";


async function setUpEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => {
        logger.info(`processing job ${job}`);

        const data: EvaluationJob = job.data;

        console.log("data:", data);

        try {
            const testCasesRunnerPromise = data.problem.testcases.map(testcases => {
                return runCode({
                    code: data.code,
                    language: data.language,
                    timeout: LANGUAGE_CONFIG[data.language].timeout,
                    imageName: LANGUAGE_CONFIG[data.language].imageName,
                    input: testcases.input
                });
            });

            const testCasesResults = await Promise.all(testCasesRunnerPromise);

            console.log("testCasesResults", testCasesResults);

        } catch (error) {
            logger.error(`Evaluation job failed: ${job}`, error);
        }

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


