import { IProblemDetails } from "../api/problem.api";
import logger from "../config/logger.config";
import { SubmissionLanguage } from "../models/submission.model";
import { submissionQueue } from "../queues/submission.queue";


export interface IsubmissionJob {
    submissionId: string;
    problem: IProblemDetails;
    code: string;
    language: SubmissionLanguage;
}

export async function addSubmissionJob(data: IsubmissionJob) {
    try {
        const job = await submissionQueue.add("evaluate-submission", data);

        logger.info(`Job submission added: ${job.id}`)
    } catch (error) {
        logger.error(`Failed to add submission job: ${error}`);
        return null;
    }
}