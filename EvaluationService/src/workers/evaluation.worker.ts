import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { EvaluationJob, TestCases, EvaluationResult } from "../interfaces/evaluation.interface";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { runCode } from "../utils/containers/codeRunner.util";
import axios from "axios";
import { serverConfig } from "../config";

function mapTestCasesWithResults(testcases: TestCases[], results: EvaluationResult[]) {
    const output: string[] = [];

    if (results.length !== testcases.length) {
        console.log("Test cases and results length mismatch");
    }

    testcases.map((testCase, index) => {
        if (results[index].status === "time_limit_exceeded") {
            output.push("TLE");
        } else if (results[index].status === "failed") {
            output.push("Error");
        } else {
            if (results[index].output === testCase.output) {
                output.push("AC");
            } else {
                output.push("WA");
            }
        }
    })

    return output;
}

/**
 * Determines the final submission verdict from per-test-case results.
 * Priority: TLE > Error > WA > AC (all must be AC to be accepted)
 */
function determineFinalVerdict(results: string[]): string {
    if (results.some(r => r === "TLE")) return "time_limit_exceeded";
    if (results.some(r => r === "Error")) return "wrong_answer";
    if (results.some(r => r === "WA")) return "wrong_answer";
    return "accepted";
}

async function updateSubmissionStatus(submissionId: string, status: string, output: string[]) {
    try {
        const url = `${serverConfig.SUBMISSION_SERVICE}/submissions/${submissionId}`;
        await axios.put(url, {
            status,
            submissionData: { status, output }
        });
        logger.info(`Submission ${submissionId} updated to status: ${status}`);
    } catch (error) {
        logger.error(`Failed to update submission ${submissionId} status: ${error}`);
    }
}

async function setUpEvaluationWorker() {
    const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => {
        logger.info(`processing job ${job.id}`);

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

            const testCasesResults = await Promise.all(testCasesRunnerPromise) as EvaluationResult[];

            console.log("testCasesResults", testCasesResults);

            const output = mapTestCasesWithResults(data.problem.testcases, testCasesResults);

            console.log("output", output);

            // Determine the final verdict and update SubmissionService
            const finalStatus = determineFinalVerdict(output);
            await updateSubmissionStatus(data.submissionId, finalStatus, output);

            return output;

        } catch (error) {
            logger.error(`Evaluation job failed for submission ${data.submissionId}:`, error);

            // Mark as failed in SubmissionService so it doesn't stay pending
            await updateSubmissionStatus(data.submissionId, "wrong_answer", []);
        }

    }, {
        connection: createNewRedisConnection(),
    });

    worker.on("error", (error) => {
        logger.error(`Evaluation worker error: ${error}`);
    });

    worker.on("completed", (job) => {
        logger.info(`Evaluation job completed ${job.id}`);
    });

    worker.on("failed", (job, error) => {
        logger.error(`Evaluation job failed: ${job?.id}`, error);
    });
}

export async function startWorkers() {
    await setUpEvaluationWorker();
}
