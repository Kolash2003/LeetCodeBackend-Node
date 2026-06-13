import { Request, Response } from "express";
import { SubmissionService } from "../services/submission.service";
import { SubmissionRepository } from "../repositories/submission.repository";
import logger from "../config/logger.config";

const submissionRepository = new SubmissionRepository();
const submissionService = new SubmissionService(submissionRepository);

export const SubmissionController = {
    async createSubmission(req: Request, res: Response): Promise<void> {
        const submission = await submissionService.createSubmission(req.body);

        res.status(201).json({
            message: "Submission created succesfully",
            data: submission,
            success: true
        });
    },

    async getSubmissionById(req: Request, res: Response): Promise<void> {
        const submission = await submissionService.getSubmissionById(req.params.id);

        res.status(200).json({
            message: "Submission fetched successfully",
            data: submission,
            success: true
        });
    },

    async getSubmissionsByProblemId(req: Request, res: Response): Promise<void> {
        const submission = await submissionService.getSubmissionsByProblemId(req.params.id);

        res.status(200).json({
            message: "Submissions fetched successfully",
            data: submission,
            success: true
        });
    },

    async deleteSubmissionById(req: Request, res: Response): Promise<void> {
        const result = await submissionService.deleteSubmissionById(req.params.id);

        res.status(200).json({
            message: "Submission deleted successfully",
            data: result,
            success: true
        });

    },

    async updateSubmissionStatus(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { status, submissionData } = req.body;

        logger.info("Update submission status", {
            submissionId: id,
            status
        });

        const submission = await submissionService.updateSubmissionStatus(id, status, submissionData);

        res.status(200).json({
            message: "Submission status updated successfully",
            data: submission,
            success: true
        });
    }
}